import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/server/session";
import { rateLimit } from "@/lib/rate-limit";
import { uploadAvatar, deleteAvatarIfOwned } from "@/server/storage";
import { getPageByUserId, updatePageAvatar } from "@/server/services/pages";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const userId = session.user.id;

    // Rate limit: 10 uploads per hour per user
    const { success: rateLimitOk } = rateLimit(`upload-avatar:${userId}`, 10, 60 * 60 * 1000);
    if (!rateLimitOk) {
      return NextResponse.json(
        { ok: false, message: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, message: "File exceeds 1MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic numbers and re-encode using sharp
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(buffer)
        .resize(512, 512, { fit: "cover" }) // Center crop to square
        .webp({ quality: 85 })
        .toBuffer();
    } catch (err) {
      return NextResponse.json(
        { ok: false, message: "Invalid image file. Please upload a valid JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    // Get current page to find the old avatar URL
    const page = await getPageByUserId(userId);
    if (!page) {
      return NextResponse.json({ ok: false, message: "Page not found" }, { status: 404 });
    }
    const oldAvatarUrl = page.avatarUrl;

    // Upload to Vercel Blob
    const { url } = await uploadAvatar({
      userId,
      data: webpBuffer,
      contentType: "image/webp",
    });

    // Update DB
    try {
      await updatePageAvatar(userId, url);
      
      // Delete old avatar if it belonged to us
      if (oldAvatarUrl) {
        await deleteAvatarIfOwned({ userId, url: oldAvatarUrl });
      }

      // Revalidate paths
      revalidatePath("/dashboard", "layout");
      revalidatePath(`/${page.username}`);
      
    } catch (dbErr) {
      // If DB update fails, clean up the new upload
      await deleteAvatarIfOwned({ userId, url });
      throw dbErr;
    }

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("[uploadAvatarRoute] Error:", error);
    return NextResponse.json({ ok: false, message: "An unexpected error occurred" }, { status: 500 });
  }
}
