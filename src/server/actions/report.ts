"use server";

import { db } from "@/server/db";
import { pages, reports } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { ReportSchema, type ReportInput } from "@/lib/validators/report";
import { headers } from "next/headers";

// In-memory rate limiting for reports (Move to Redis later)
// structure: "ip" => { count: number, expiresAt: number, pages: Record<string, number> }
const reportRateLimit = new Map<string, { count: number; expiresAt: number; pages: Record<string, number> }>();

export type ReportResult = 
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string[]>; message?: string };

export async function submitReportAction(data: ReportInput): Promise<ReportResult> {
  try {
    // 1. Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const now = Date.now();
    const limiter = reportRateLimit.get(ip);
    
    if (limiter && limiter.expiresAt > now) {
      if (limiter.count >= 5) {
        return { ok: false, message: "Too many reports submitted. Please try again later." };
      }
      if (limiter.pages[data.username] >= 1) {
        return { ok: false, message: "You have already reported this page recently." };
      }
    }

    // 2. Validation
    const parsed = ReportSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Invalid input",
      };
    }
    
    const { username, reason, details, honeypot } = parsed.data;

    // 3. Honeypot check (pretend success)
    if (honeypot && honeypot.length > 0) {
      return { ok: true };
    }

    // 4. Lookup page
    const cleanUsername = username.trim().toLowerCase();
    const page = await db.query.pages.findFirst({
      where: eq(sql`lower(${pages.username})`, cleanUsername),
      columns: { id: true, isPublished: true },
    });

    if (!page || !page.isPublished) {
      return { ok: false, message: "Page not found" };
    }

    // 5. Update rate limit
    if (limiter && limiter.expiresAt > now) {
      limiter.count += 1;
      limiter.pages[cleanUsername] = 1;
    } else {
      reportRateLimit.set(ip, {
        count: 1,
        expiresAt: now + 3600000, // 1 hour
        pages: { [cleanUsername]: 1 },
      });
    }

    // 6. Insert report
    await db.insert(reports).values({
      pageId: page.id,
      reason,
      details: details || null,
    });

    return { ok: true };
  } catch (err) {
    console.error("[submitReportAction] Error:", err);
    return { ok: false, message: "An unexpected error occurred. Please try again." };
  }
}
