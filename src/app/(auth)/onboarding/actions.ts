"use server";

import { inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { pages } from "@/server/db/schema";
import { getSession } from "@/server/session";
import { createPage, isUsernameAvailable } from "@/server/services/pages";
import { validateUsernameFormat } from "@/lib/validators/username";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { rateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";

export async function checkUsername(username: string) {
  const session = await getSession();
  if (!session) return { valid: false, reason: "invalid" as const, message: "Unauthorized" };

  const formatCheck = validateUsernameFormat(username);
  if (!formatCheck.valid) {
    return formatCheck;
  }

  const available = await isUsernameAvailable(formatCheck.username);
  if (!available) {
    return { valid: false, reason: "taken" as const, message: "This username is already taken" };
  }

  return { valid: true, reason: "available" as const, username: formatCheck.username };
}

/**
 * Suggest available username alternatives when a desired name is taken.
 * Generates variants, validates each with the existing validator, checks availability
 * in ONE database query, and returns only names that are available (up to 3).
 */
export async function suggestUsernames(base: string): Promise<{ suggestions: string[] }> {
  const session = await getSession();
  if (!session) return { suggestions: [] };

  const rl = rateLimit(`user:${session.user.id}:suggest`, 20, 60000);
  if (!rl.success) return { suggestions: [] };

  const cleaned = base.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!cleaned) return { suggestions: [] };

  const rawCandidates = [
    `${cleaned}1`,
    `${cleaned}_hq`,
    `${cleaned}2`,
    `${cleaned}_bio`,
    `the_${cleaned}`,
    `${cleaned}app`,
    `${cleaned}99`,
  ];

  const validCandidates: string[] = [];
  for (const cand of rawCandidates) {
    const res = validateUsernameFormat(cand);
    if (res.valid && !isReservedUsername(res.username)) {
      validCandidates.push(res.username);
    }
  }

  if (validCandidates.length === 0) return { suggestions: [] };

  const takenRows = await db
    .select({ username: sql<string>`lower(${pages.username})` })
    .from(pages)
    .where(inArray(sql`lower(${pages.username})`, validCandidates));

  const takenSet = new Set(takenRows.map((r) => r.username.toLowerCase()));
  const available = validCandidates.filter((cand) => !takenSet.has(cand)).slice(0, 3);

  return { suggestions: available };
}

/**
 * Returns up to 2 initial suggestions derived from the logged-in user's Google name.
 * Validates with the same rules and checks availability in ONE database query.
 */
export async function getInitialSuggestions(): Promise<{ suggestions: string[] }> {
  const session = await getSession();
  if (!session || !session.user.name) return { suggestions: [] };

  const rl = rateLimit(`user:${session.user.id}:initial-suggest`, 20, 60000);
  if (!rl.success) return { suggestions: [] };

  const nameParts = session.user.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (nameParts.length === 0) return { suggestions: [] };

  const candidates: string[] = [];
  if (nameParts[0]) candidates.push(nameParts[0]);
  if (nameParts.length > 1) {
    candidates.push(nameParts.join(""));
    candidates.push(`${nameParts[0]}_${nameParts[1]}`);
  }

  const validCandidates: string[] = [];
  for (const cand of candidates) {
    const res = validateUsernameFormat(cand);
    if (res.valid && !isReservedUsername(res.username)) {
      validCandidates.push(res.username);
    }
  }

  if (validCandidates.length === 0) return { suggestions: [] };

  const takenRows = await db
    .select({ username: sql<string>`lower(${pages.username})` })
    .from(pages)
    .where(inArray(sql`lower(${pages.username})`, validCandidates));

  const takenSet = new Set(takenRows.map((r) => r.username.toLowerCase()));
  const available = validCandidates.filter((cand) => !takenSet.has(cand)).slice(0, 2);

  return { suggestions: available };
}

export async function submitOnboarding(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const rawUsername = formData.get("username") as string;
  if (!rawUsername) {
    return { error: "Username is required" };
  }

  const formatCheck = validateUsernameFormat(rawUsername);
  if (!formatCheck.valid) {
    return { error: formatCheck.message };
  }

  const result = await createPage({
    userId: session.user.id,
    username: formatCheck.username,
    displayName: session.user.name,
    avatarUrl: session.user.image,
  });

  if (!result.success) {
    if (result.reason === "taken") return { error: "Username is already taken" };
    if (result.reason === "already_exists") return { error: "You already have a page" };
    return { error: "Failed to create page" };
  }

  const { revalidateTag } = await import("next/cache");
  revalidateTag(`page:${formatCheck.username.toLowerCase()}`, { expire: 0 });

  redirect("/dashboard");
}
