import { z } from "zod";
import { isSafeHttpUrl } from "../safe-url";

export const BlockSchema = z
  .object({
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

    layout: z.enum(["classic", "thumb", "featured"]).optional().default("classic"),
    isHighlighted: z.boolean().optional().default(false),
    thumbnailAlt: z
      .string()
      .trim()
      .max(120, "Alt text must be 120 characters or less")
      .nullable()
      .optional(),
  })
  .strict(); // NEVER accept thumbnail_url or thumbnailUrl from client input

export const EditBlockSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(60, "Title must be 60 characters or less")
      .transform((val) => val.replace(/\s+/g, " "))
      .transform((val) => val.replace(/[\u200B-\u200D\uFEFF\x00-\x1F\x7F]/g, "")),

    url: z
      .string()
      .trim()
      .min(1, "URL is required")
      .transform((val) => {
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

    layout: z.enum(["classic", "thumb", "featured"]).optional(),
    isHighlighted: z.boolean().optional(),
    thumbnailAlt: z
      .string()
      .trim()
      .max(120, "Alt text must be 120 characters or less")
      .nullable()
      .optional(),
  })
  .strict(); // NEVER accept thumbnail_url or thumbnailUrl from client input

export const HeaderSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(60, "Title must be 60 characters or less")
      .transform((val) => val.replace(/\s+/g, " "))
      .transform((val) => val.replace(/[\u200B-\u200D\uFEFF\x00-\x1F\x7F]/g, "")),
  })
  .strict();

export type BlockInput = z.infer<typeof BlockSchema>;
export type EditBlockInput = z.infer<typeof EditBlockSchema>;
export type HeaderInput = z.infer<typeof HeaderSchema>;

