import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Returns the current session or null.
 * Safe to call in Server Components, layouts, and route handlers.
 */
export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("[getSession] Session retrieval error, safely falling back to null:", error);
    return null;
  }
}

/**
 * Returns the session or redirects to /login.
 * Use in pages and layouts that require authentication.
 */
export async function requireUser(redirectTo?: string) {
  const session = await getSession();
  if (!session) {
    const loginUrl = redirectTo
      ? `/login?callbackUrl=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(loginUrl);
  }
  return session;
}
