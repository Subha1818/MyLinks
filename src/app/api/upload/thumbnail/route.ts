import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/session";
import { rateLimit } from "@/lib/rate-limit";
import { uploadThumbnail, deleteThumbnailIfOwned } from "@/server/storage";
import { getPageByUserId } from "@/server/services/pages";
import { db } from "@/server/db";
import { blocks } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { MAX_THUMBNAILS_PER_PAGE } from "@/lib/limits";
import sharp from "sharp";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

function isValidImageMagicBytes(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // JPEG: FF D8 FF
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;
  // WebP: RIFF .... WEBP
  const isWebp =
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP";

  return isJpeg || isPng || isWebp;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate limit: 10 uploads per hour per user
    const { success: rateLimitOk } = rateLimit(`upload-thumbnail:${userId}`, 10, 60 * 60 * 1000);
    if (!rateLimitOk) {
      return NextResponse.json(
        { ok: false, message: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const blockId = formData.get("blockId") as string | null;
    const layout = formData.get("layout") as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: "No file provided" }, { status: 400 });
    }

    if (!blockId) {
      return NextResponse.json({ ok: false, message: "No block ID provided" }, { status: 400 });
    }

    if (layout !== "thumb" && layout !== "featured") {
      return NextResponse.json(
        { ok: false, message: "Layout must be 'thumb' or 'featured'" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, message: "File exceeds 1MB limit" }, { status: 400 });
    }

    // Verify page ownership
    const page = await getPageByUserId(userId);
    if (!page) {
      return NextResponse.json({ ok: false, message: "Page not found" }, { status: 404 });
    }

    // Verify block ownership & type = 'link'
    const blockRows = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, blockId), eq(blocks.pageId, page.id), eq(blocks.type, "link")))
      .limit(1);

    if (blockRows.length === 0) {
      return NextResponse.json({ ok: false, message: "Link not found" }, { status: 404 });
    }

    const targetBlock = blockRows[0];
    const oldThumbnailUrl = targetBlock.thumbnailUrl;

    // Limit check: count images on OTHER blocks
    const otherImageBlocks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blocks)
      .where(
        and(
          eq(blocks.pageId, page.id),
          sql`${blocks.id} <> ${blockId}`,
          sql`${blocks.thumbnailUrl} IS NOT NULL`
        )
      );

    const otherImagesCount = otherImageBlocks[0]?.count || 0;
    if (otherImagesCount >= MAX_THUMBNAILS_PER_PAGE) {
      return NextResponse.json(
        {
          ok: false,
          message: `You've used all ${MAX_THUMBNAILS_PER_PAGE} photo slots. Remove an image from another link to add one here.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes
    if (!isValidImageMagicBytes(buffer)) {
      return NextResponse.json(
        { ok: false, message: "Invalid image format. Only JPEG, PNG, or WebP images are allowed." },
        { status: 400 }
      );
    }

    // Re-encode with sharp: WebP, cover-crop 1000x625 (16:10), quality 82, metadata stripped
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(buffer)
        .resize(1000, 625, { fit: "cover", position: "centre" })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Could not process image file." },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob under thumbnails/{userId}/
    const { url } = await uploadThumbnail({
      userId,
      data: webpBuffer,
      contentType: "image/webp",
    });

    // In one DB update set thumbnail_url, layout, updated_at
    try {
      await db
        .update(blocks)
        .set({
          thumbnailUrl: url,
          layout,
          updatedAt: new Date(),
        })
        .where(and(eq(blocks.id, blockId), eq(blocks.pageId, page.id)));

      // Delete previous blob if it exists
      if (oldThumbnailUrl) {
        await deleteThumbnailIfOwned({ userId, url: oldThumbnailUrl });
      }

      // Revalidate cache and paths
      revalidatePath("/dashboard", "layout");
      revalidatePath(`/${page.username}`, "page");
      revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

      return NextResponse.json({ ok: true, url, layout });
    } catch (dbErr) {
      // If DB update fails, delete newly uploaded blob
      await deleteThumbnailIfOwned({ userId, url });
      throw dbErr;
    }
  } catch (error) {
    console.error("[uploadThumbnailRoute] Error:", error);
    const msg = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
