import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { pages } from "@/server/db/schema";
import { generateId } from "@/lib/utils";

export type CreatePageInput = {
  userId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

/**
 * Create a page for a user.
 * Returns { success: true, page } or { success: false, reason: 'taken' | 'already_exists' | 'error' }
 */
export async function createPage(input: CreatePageInput) {
  const username = input.username.trim().toLowerCase();

  try {
    // Check if user already has a page
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.userId, input.userId))
      .limit(1);

    if (existing.length > 0) {
      return { success: false as const, reason: "already_exists" as const };
    }

    const [page] = await db
      .insert(pages)
      .values({
        id: generateId(),
        userId: input.userId,
        username,
        displayName: input.displayName ?? null,
        avatarUrl: input.avatarUrl ?? null,
        theme: {},
        isPublished: true,
      })
      .returning();

    return { success: true as const, page: page! };
  } catch (err) {
    // Postgres unique constraint violation (duplicate username)
    if (isUniqueViolation(err)) {
      return { success: false as const, reason: "taken" as const };
    }
    console.error("[createPage] unexpected error:", err);
    return { success: false as const, reason: "error" as const };
  }
}

/**
 * Get the page belonging to a user, or null.
 */
export async function getPageByUserId(userId: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.userId, userId))
    .limit(1);
  return page ?? null;
}

/**
 * Check if a username is available (case-insensitive).
 * Returns true if available, false if taken.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const lower = username.trim().toLowerCase();
  const [row] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(sql`lower(${pages.username}) = ${lower}`)
    .limit(1);
  return !row;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

export type UpdateProfileInput = {
  displayName: string;
  bio: string | null;
};

/**
 * Update a user's page profile fields (display name and bio).
 */
export async function updatePageProfile(userId: string, data: UpdateProfileInput) {
  const [updated] = await db
    .update(pages)
    .set({
      displayName: data.displayName,
      bio: data.bio,
      updatedAt: new Date(),
    })
    .where(eq(pages.userId, userId))
    .returning();

  return updated ?? null;
}
