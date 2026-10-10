import { z } from "zod";
import type { CSSProperties } from "react";

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

// -------------------------------------------------------------
// Background models (Discriminated union on "type")
// -------------------------------------------------------------
export const SolidBackgroundSchema = z
  .object({
    type: z.literal("solid"),
    value: z.string().regex(hexColorRegex, "Invalid hex color"),
  })
  .strict();
export type SolidBackground = z.infer<typeof SolidBackgroundSchema>;

export const GradientDirectionSchema = z.enum(["vertical", "diagonal", "horizontal"]);
export type GradientDirection = z.infer<typeof GradientDirectionSchema>;

export const GradientBackgroundSchema = z
  .object({
    type: z.literal("gradient"),
    from: z.string().regex(hexColorRegex, "Invalid hex color"),
    to: z.string().regex(hexColorRegex, "Invalid hex color"),
    direction: GradientDirectionSchema,
  })
  .strict();
export type GradientBackground = z.infer<typeof GradientBackgroundSchema>;

export const PatternKindSchema = z.enum(["dots", "stripes", "grid", "checks"]);
export type PatternKind = z.infer<typeof PatternKindSchema>;

export const PatternSizeSchema = z.enum(["small", "medium", "large"]);
export type PatternSize = z.infer<typeof PatternSizeSchema>;

export const PatternBackgroundSchema = z
  .object({
    type: z.literal("pattern"),
    base: z.string().regex(hexColorRegex, "Invalid hex color"),
    color: z.string().regex(hexColorRegex, "Invalid hex color"),
    kind: PatternKindSchema,
    size: PatternSizeSchema,
  })
  .strict();
export type PatternBackground = z.infer<typeof PatternBackgroundSchema>;

export const BackgroundSchema = z.discriminatedUnion("type", [
  SolidBackgroundSchema,
  GradientBackgroundSchema,
  PatternBackgroundSchema,
]);
export type ThemeBackground = z.infer<typeof BackgroundSchema>;

// -------------------------------------------------------------
// Layout models (Alignment, avatar shape, and button spacing)
// -------------------------------------------------------------
export const LayoutAlignSchema = z.enum(["center", "left"]);
export type LayoutAlign = z.infer<typeof LayoutAlignSchema>;

export const AvatarShapeSchema = z.enum(["circle", "rounded", "square"]);
export type AvatarShape = z.infer<typeof AvatarShapeSchema>;

export const SpacingSchema = z.enum(["compact", "normal", "relaxed"]);
export type Spacing = z.infer<typeof SpacingSchema>;

export const LayoutSchema = z
  .object({
    align: LayoutAlignSchema.default("center"),
    avatarShape: AvatarShapeSchema.default("circle"),
    spacing: SpacingSchema.default("normal"),
  })
  .strict();
export type LayoutConfig = z.infer<typeof LayoutSchema>;

export const DEFAULT_LAYOUT: LayoutConfig = {
  align: "center",
  avatarShape: "circle",
  spacing: "normal",
};

// -------------------------------------------------------------
// Main Theme Schema
// -------------------------------------------------------------
export const ThemeSchema = z
  .object({
    background: BackgroundSchema,
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
    layout: LayoutSchema.default(DEFAULT_LAYOUT),
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
  layout: DEFAULT_LAYOUT,
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

// -------------------------------------------------------------
// CSS Background Rendering Helpers (Safe Fixed Templates)
// -------------------------------------------------------------
function hexToRgba18(hex: string): string {
  const sanitized = hex.replace("#", "").trim();
  let full = sanitized;
  if (sanitized.length === 3) {
    full = sanitized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(full, 16);
  if (isNaN(num)) return "rgba(0, 0, 0, 0.18)";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, 0.18)`;
}

export function getThemeBackgroundStyle(bg: ThemeBackground): CSSProperties {
  if (bg.type === "solid") {
    return {
      backgroundColor: bg.value,
    };
  }

  if (bg.type === "gradient") {
    let angle = "to bottom";
    if (bg.direction === "horizontal") angle = "to right";
    else if (bg.direction === "diagonal") angle = "135deg";

    return {
      backgroundColor: bg.from,
      backgroundImage: `linear-gradient(${angle}, ${bg.from}, ${bg.to})`,
    };
  }

  // Pattern backgrounds
  const sizeMap: Record<PatternSize, number> = {
    small: 16,
    medium: 28,
    large: 44,
  };
  const sizePx = sizeMap[bg.size] || 28;
  const rgba = hexToRgba18(bg.color);

  switch (bg.kind) {
    case "dots": {
      const dotRadius = bg.size === "small" ? 1.5 : bg.size === "large" ? 2.5 : 2;
      return {
        backgroundColor: bg.base,
        backgroundImage: `radial-gradient(${rgba} ${dotRadius}px, transparent ${dotRadius}px)`,
        backgroundSize: `${sizePx}px ${sizePx}px`,
        backgroundRepeat: "repeat",
      };
    }
    case "stripes": {
      const stripeWidth = Math.round(sizePx / 2);
      return {
        backgroundColor: bg.base,
        backgroundImage: `repeating-linear-gradient(45deg, ${rgba}, ${rgba} ${stripeWidth}px, transparent ${stripeWidth}px, transparent ${stripeWidth * 2}px)`,
        backgroundRepeat: "repeat",
      };
    }
    case "grid": {
      return {
        backgroundColor: bg.base,
        backgroundImage: `linear-gradient(to right, ${rgba} 1px, transparent 1px), linear-gradient(to bottom, ${rgba} 1px, transparent 1px)`,
        backgroundSize: `${sizePx}px ${sizePx}px`,
        backgroundRepeat: "repeat",
      };
    }
    case "checks": {
      return {
        backgroundColor: bg.base,
        backgroundImage: `conic-gradient(${rgba} 90deg, transparent 90deg 180deg, ${rgba} 180deg 270deg, transparent 270deg)`,
        backgroundSize: `${sizePx}px ${sizePx}px`,
        backgroundRepeat: "repeat",
      };
    }
    default:
      return { backgroundColor: bg.base };
  }
}

export function getThemeOgBackground(bg: ThemeBackground): string {
  if (bg.type === "gradient") return bg.from;
  if (bg.type === "pattern") return bg.base;
  return bg.value;
}
