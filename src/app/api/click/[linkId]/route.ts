import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { blocks, pages, clickEvents } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { after } from "next/server";
import { isBot, parseDevice, sanitizeCountry } from "@/lib/analytics";
import { isSafeHttpUrl } from "@/lib/safe-url";

const clickRateLimit = new Map<string, { count: number; expiresAt: number }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;

  // 1. Validate linkId as UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(linkId)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    // 2. ONE query: load the block together with its page
    const blockData = await db
      .select({
        url: blocks.url,
        blockId: blocks.id,
        pageId: blocks.pageId,
        isVisible: blocks.isVisible,
        isPublished: pages.isPublished,
      })
      .from(blocks)
      .innerJoin(pages, eq(blocks.pageId, pages.id))
      .where(eq(blocks.id, linkId))
      .limit(1);

    if (!blockData || blockData.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const block = blockData[0];

    if (!block.isVisible || !block.isPublished) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 3. Re-check the stored URL with isSafeHttpUrl
    if (!isSafeHttpUrl(block.url)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const destination = block.url;
    const userAgent = req.headers.get("user-agent");
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const countryHeader = req.headers.get("x-vercel-ip-country");
    const isHead = req.method === "HEAD";
    const isPrefetch =
      req.headers.get("purpose") === "prefetch" ||
      req.headers.get("sec-purpose") === "prefetch";

    // 5. Record the click AFTER sending the response
    after(async () => {
      console.log(`[Click API] Processing after() for block: ${block.blockId}`);
      try {
        // 6. Do NOT record when: bot, HEAD request, or prefetch header
        if (isHead || isPrefetch || isBot(userAgent)) {
          console.log(`[Click API] Ignoring click. isHead=${isHead}, isPrefetch=${isPrefetch}, isBot=${isBot(userAgent)}`);
          return;
        }

        // 7. Anti-inflation limiter (Move to Redis/Upstash later)
        const now = Date.now();
        const limitKey = `${ip}:${block.blockId}`;
        const limiter = clickRateLimit.get(limitKey);

        if (limiter && limiter.expiresAt > now) {
          if (limiter.count >= 20) {
            console.log(`[Click API] Rate limited: ${limitKey}`);
            return; // Over limit
          }
          limiter.count += 1;
        } else {
          clickRateLimit.set(limitKey, { count: 1, expiresAt: now + 60000 });
        }

        const device = parseDevice(userAgent);
        const country = sanitizeCountry(countryHeader);

        console.log(`[Click API] Inserting click... device=${device}, country=${country}`);
        await db.insert(clickEvents).values({
          blockId: block.blockId,
          pageId: block.pageId,
          country,
          device,
        });
        console.log(`[Click API] Click inserted successfully!`);
      } catch (err) {
        console.error("Failed to record click event", err);
      }
    });

    // 4. Respond with 302 and Cache-Control
    return NextResponse.redirect(destination, {
      status: 302,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // 8. Never reveal why a 404 happened
    return new NextResponse("Not Found", { status: 404 });
  }
}
