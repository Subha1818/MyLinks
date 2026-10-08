import { z } from "zod";
import { isReservedUsername } from "@/lib/reserved-usernames";

/**
 * Username rules:
 * - 3–30 characters
 * - Only lowercase letters, numbers, underscores and hyphens
 * - Must start and end with a letter or number
 * - Trim and lowercase before validating
 * - Must not be reserved
 */
export const usernameSchema = z
  .string()
  .transform((val) => val.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$/,
        "Username may only contain lowercase letters, numbers, underscores and hyphens, and must start and end with a letter or number"
      )
      .refine((val) => !isReservedUsername(val), {
        message: "This username is reserved and cannot be used",
      })
  );

export type UsernameInput = z.input<typeof usernameSchema>;
export type UsernameOutput = z.output<typeof usernameSchema>;

/**
 * Result of validating a username
 */
export type UsernameValidationResult =
  | { valid: true; username: string }
  | { valid: false; reason: "invalid" | "reserved" | "taken"; message: string };

/**
 * Validates username format and reserved check without a DB query.
 * Used on both client (for UX) and server (for security).
 */
export function validateUsernameFormat(raw: string): UsernameValidationResult {
  const result = usernameSchema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid username";
    const isReserved = message.includes("reserved");
    return {
      valid: false,
      reason: isReserved ? "reserved" : "invalid",
      message,
    };
  }
  return { valid: true, username: result.data };
}
