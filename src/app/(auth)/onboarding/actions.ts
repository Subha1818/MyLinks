"use server";

import { getSession } from "@/server/session";
import { createPage, isUsernameAvailable } from "@/server/services/pages";
import { validateUsernameFormat } from "@/lib/validators/username";
import { redirect } from "next/navigation";

export async function checkUsername(username: string) {
  const session = await getSession();
  if (!session) return { valid: false, message: "Unauthorized" };

  const formatCheck = validateUsernameFormat(username);
  if (!formatCheck.valid) {
    return formatCheck;
  }

  const available = await isUsernameAvailable(formatCheck.username);
  if (!available) {
    return { valid: false, reason: "taken", message: "This username is already taken" };
  }

  return { valid: true, username: formatCheck.username };
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

  // Next.js requires importing revalidateTag
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`page:${formatCheck.username.toLowerCase()}`, { expire: 0 });

  redirect("/dashboard");
}
