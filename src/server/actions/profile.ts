"use server";

import { requireUser } from "@/server/session";
import { updatePageProfile } from "@/server/services/pages";
import { profileSchema, ProfileInput, ProfileOutput } from "@/lib/validators/profile";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export type UpdateProfileResult = 
  | { ok: true; profile: ProfileOutput }
  | { ok: false; fieldErrors?: Record<string, string[]>; message?: string };

export async function updateProfile(data: ProfileInput): Promise<UpdateProfileResult> {
  const session = await requireUser();
  const userId = session.user.id;

  // Rate limit: 20 requests per minute per user
  const { success: rateLimitOk } = rateLimit(`update-profile:${userId}`, 20, 60_000);
  if (!rateLimitOk) {
    return {
      ok: false,
      message: "You're saving too fast. Please wait a moment and try again.",
    };
  }

  // Validate input
  const result = profileSchema.safeParse(data);
  if (!result.success) {
    return {
      ok: false,
      fieldErrors: result.error.flatten().fieldErrors,
      message: "Invalid profile data. Please check the fields and try again.",
    };
  }

  try {
    const updated = await updatePageProfile(userId, result.data);
    
    if (!updated) {
      return { ok: false, message: "Page not found for this user." };
    }

    // Revalidate dashboard and public page
    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${updated.username}`);

    return { ok: true, profile: result.data };
  } catch (error) {
    console.error("[updateProfile] Error:", error);
    return { ok: false, message: "An unexpected error occurred while saving." };
  }
}

export async function removeAvatar() {
  const session = await requireUser();
  const userId = session.user.id;

  try {
    const { getPageByUserId, updatePageAvatar } = await import("@/server/services/pages");
    const { deleteAvatarIfOwned } = await import("@/server/storage");
    
    const page = await getPageByUserId(userId);
    if (!page || !page.avatarUrl) {
      return { ok: false, message: "No avatar to remove." };
    }

    const oldAvatarUrl = page.avatarUrl;
    
    // Clear in DB first
    await updatePageAvatar(userId, null);
    
    // Delete blob if owned
    await deleteAvatarIfOwned({ userId, url: oldAvatarUrl });

    // Revalidate
    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`);

    return { ok: true };
  } catch (error) {
    console.error("[removeAvatar] Error:", error);
    return { ok: false, message: "An unexpected error occurred." };
  }
}
