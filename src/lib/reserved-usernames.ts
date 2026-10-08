export const RESERVED_USERNAMES = new Set([
  // From project.md section 6
  "admin",
  "api",
  "app",
  "dashboard",
  "login",
  "register",
  "signup",
  "logout",
  "settings",
  "pricing",
  "about",
  "help",
  "support",
  "terms",
  "privacy",
  "verify-email",
  "forgot-password",
  "reset-password",
  "_next",
  "static",
  "public",
  "assets",
  "www",
  "me",
  "null",
  "undefined",
  // Top-level app routes
  "onboarding",
  "dashboard",
  "home",
  "icon",
  "favicon",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase().trim());
}
