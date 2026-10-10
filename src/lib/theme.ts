import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const ButtonStyleSchema = z.enum(["solid", "outline", "hard-shadow"]);
export type ButtonStyle = z.infer<typeof ButtonStyleSchema>;

export const ButtonShapeSchema = z.enum(["pill", "rounded", "square"]);
export type ButtonShape = z.infer<typeof ButtonShapeSchema>;

export const FONT_OPTIONS = [
  { id: "bricolage", label: "Bricolage Grotesque", description: "Bold display" },
  { id: "dm-sans", label: "DM Sans", description: "Clean" },
  { id: "fraunces", label: "Fraunces", description: "Soft serif" },
  { id: "dm-mono", label: "DM Mono", description: "Mono" },
  { id: "archivo", label: "Archivo", description: "Sturdy grotesque" },
  { id: "caveat", label: "Caveat", description: "Handwritten" },
] as const;

export const FontSchema = z.enum([
  "bricolage",
  "dm-sans",
  "fraunces",
  "dm-mono",
  "archivo",
  "caveat",
]);
export type FontOption = z.infer<typeof FontSchema>;

export const ThemeSchema = z
  .object({
    background: z
      .object({
        type: z.literal("solid"),
        value: z.string().regex(hexColorRegex, "Invalid hex color"),
      })
      .strict(),
    textColor: z.string().regex(hexColorRegex, "Invalid hex color"),
    button: z
      .object({
        shape: ButtonShapeSchema,
        style: ButtonStyleSchema.default("solid"),
        fill: z.string().regex(hexColorRegex, "Invalid hex color"),
        textColor: z.string().regex(hexColorRegex, "Invalid hex color"),
      })
      .strict(),
    font: FontSchema,
  })
  .strict();

export type ThemeConfig = z.infer<typeof ThemeSchema>;

export const DEFAULT_THEME: ThemeConfig = {
  background: { type: "solid", value: "#D4E83A" },
  textColor: "#1F4D1A",
  button: {
    shape: "pill",
    style: "solid",
    fill: "#FFFFFF",
    textColor: "#14181F",
  },
  font: "bricolage",
};

export function resolveTheme(raw: unknown): ThemeConfig {
  if (!raw || typeof raw !== "object" || Object.keys(raw).length === 0) {
    return DEFAULT_THEME;
  }
  const result = ThemeSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  return DEFAULT_THEME;
}
