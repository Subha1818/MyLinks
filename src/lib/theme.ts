import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const ThemeSchema = z.object({
  background: z.object({
    type: z.literal("solid"),
    value: z.string().regex(hexColorRegex, "Invalid hex color"),
  }),
  textColor: z.string().regex(hexColorRegex, "Invalid hex color"),
  button: z.object({
    shape: z.enum(["pill", "rounded", "square"]),
    fill: z.string().regex(hexColorRegex, "Invalid hex color"),
    textColor: z.string().regex(hexColorRegex, "Invalid hex color"),
  }),
  font: z.enum(["bricolage", "dm-sans"]),
});

export type ThemeConfig = z.infer<typeof ThemeSchema>;

export const DEFAULT_THEME: ThemeConfig = {
  background: { type: "solid", value: "#D4E83A" },
  textColor: "#1F4D1A",
  button: {
    shape: "pill",
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
