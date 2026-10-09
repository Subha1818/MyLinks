import { z } from "zod";
import { isSafeHttpUrl } from "../safe-url";

export const BlockSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(60, "Title must be 60 characters or less")
    .transform((val) => val.replace(/\s+/g, " ")) // collapse spaces
    .transform((val) => val.replace(/[\u200B-\u200D\uFEFF\x00-\x1F\x7F]/g, "")), // strip zero-width and control chars

  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .transform((val) => {
      // Prepend https:// if no scheme is provided
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        return `https://${val}`;
      }
      return val;
    })
    .refine((val) => isSafeHttpUrl(val), {
      message: "Only safe http and https links are allowed",
    })
    .transform((val) => {
      try {
        return new URL(val).href;
      } catch {
        return val;
      }
    })
    .refine((val) => val.length <= 2048, {
      message: "URL must be 2048 characters or less",
    }),
});

export type BlockInput = z.infer<typeof BlockSchema>;
