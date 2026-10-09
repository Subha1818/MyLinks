import { z } from "zod";

function stripInvalidChars(str: string) {
  // Strip control chars and zero-width chars but keep newlines
  return str.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");
}

function collapseSpaces(str: string) {
  return str.replace(/[^\S\r\n]+/g, " "); // collapse horizontal whitespace
}

function formatBio(str: string) {
  // collapse >2 consecutive newlines to exactly 2
  return str.replace(/(\r?\n){3,}/g, "\n\n");
}

export const profileSchema = z.object({
  displayName: z
    .string()
    .transform((v) => collapseSpaces(stripInvalidChars(v)).trim())
    .pipe(
      z
        .string()
        .min(1, "Display name is required")
        .max(50, "Display name cannot exceed 50 characters")
    ),
  bio: z
    .string()
    .transform((v) => formatBio(collapseSpaces(stripInvalidChars(v))).trim())
    .pipe(z.string().max(160, "Bio cannot exceed 160 characters"))
    .optional()
    .transform((v) => v || null), // Store empty string as null consistently
});

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileOutput = z.output<typeof profileSchema>;
