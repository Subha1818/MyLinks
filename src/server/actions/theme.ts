"use server";

import { requireUser } from "@/server/session";
import { getPageByUserId, updatePageTheme } from "@/server/services/pages";
import { ThemeSchema, ThemeConfig } from "@/lib/theme";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath, revalidateTag } from "next/cache";

export type UpdateThemeResult =
  | { ok: true; theme: ThemeConfig }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function updateTheme(input: unknown): Promise<UpdateThemeResult> {
  const session = await requireUser();
  const userId = session.user.id;

  // Rate limit: 20 requests per minute per user
  const { success: rateLimitOk } = rateLimit(`update-theme:${userId}`, 20, 60_000);
  if (!rateLimitOk) {
    return {
      ok: false,
      message: "You're saving too fast. Please wait a moment and try again.",
    };
  }

  // Look up page for authenticated user
  const page = await getPageByUserId(userId);
  if (!page) {
    return { ok: false, message: "Page not found for this user." };
  }

  // Validate input against strict ThemeSchema
  const result = ThemeSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      message: "Invalid theme data. Please select a valid theme preset.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Store only the validated, normalized config object
    const updated = await updatePageTheme(userId, result.data);
    if (!updated) {
      return { ok: false, message: "Failed to update theme." };
    }

    // Invalidate dashboard and public page caches
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/appearance", "page");
    revalidatePath(`/${page.username}`, "page");
    revalidatePath(`/${page.username}/opengraph-image`);
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true, theme: result.data };
  } catch (error) {
    console.error("[updateTheme] Error updating theme:", error);
    return { ok: false, message: "An unexpected error occurred while saving the theme." };
  }
}
