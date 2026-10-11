/**
 * Centralized public URL helpers for MyLinks.
 * Derived from NEXT_PUBLIC_APP_URL with fallback to window.location.origin.
 */

export function getPublicUrl(username: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const cleanBase = base.replace(/\/+$/, "");
  return `${cleanBase}/${username}`;
}

export function getPublicUrlDisplay(username: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  try {
    const urlObj = new URL(base);
    const host = urlObj.host;
    return `${host}/${username}`;
  } catch {
    return `${base.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/${username}`;
  }
}
