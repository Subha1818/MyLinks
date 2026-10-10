import { contrastRatio, hexToRgb } from "./contrast";
import { ThemeConfig, ThemeBackground } from "./theme";

/**
 * Normalizes hex color input.
 * Accepts "#abc", "abc", "#aabbcc", "AABBCC", with surrounding whitespace.
 * Returns uppercase "#RRGGBB" or null if invalid.
 */
export function normalizeHex(input: string | null | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const full = hex
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${full.toUpperCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toUpperCase()}`;
  }

  return null;
}

/**
 * Blends an overlay color at a given opacity (e.g. 18%) over a base color.
 */
export function blendColors(baseHex: string, overlayHex: string, opacity: number = 0.18): string {
  try {
    const [r1, g1, b1] = hexToRgb(baseHex);
    const [r2, g2, b2] = hexToRgb(overlayHex);
    const r = Math.round(r1 * (1 - opacity) + r2 * opacity);
    const g = Math.round(g1 * (1 - opacity) + g2 * opacity);
    const b = Math.round(b1 * (1 - opacity) + b2 * opacity);
    const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return baseHex;
  }
}

/**
 * Calculates worst-case contrast ratio of a text color against a background.
 * For solid: direct contrast.
 * For gradient: min contrast across both stops.
 * For pattern: min contrast across base color and blended 18% pattern color.
 */
export function backgroundContrastRatio(textColor: string, bg: ThemeBackground): number {
  if (bg.type === "solid") {
    return contrastRatio(textColor, bg.value);
  }

  if (bg.type === "gradient") {
    const ratioFrom = contrastRatio(textColor, bg.from);
    const ratioTo = contrastRatio(textColor, bg.to);
    return Math.min(ratioFrom, ratioTo);
  }

  // Pattern
  const blended = blendColors(bg.base, bg.color, 0.18);
  const ratioBase = contrastRatio(textColor, bg.base);
  const ratioBlended = contrastRatio(textColor, blended);
  return Math.min(ratioBase, ratioBlended);
}

/**
 * Returns #14181F or #FFFFFF, whichever has higher contrast on the given solid color.
 */
export function readableTextOn(bg: string): "#14181F" | "#FFFFFF" {
  const normBg = normalizeHex(bg) || "#FFFFFF";
  const darkRatio = contrastRatio("#14181F", normBg);
  const lightRatio = contrastRatio("#FFFFFF", normBg);
  return darkRatio >= lightRatio ? "#14181F" : "#FFFFFF";
}

/**
 * Returns #14181F or #FFFFFF, whichever has higher worst-case contrast on any background type.
 */
export function readableTextOnBackground(bg: ThemeBackground): "#14181F" | "#FFFFFF" {
  const darkRatio = backgroundContrastRatio("#14181F", bg);
  const lightRatio = backgroundContrastRatio("#FFFFFF", bg);
  return darkRatio >= lightRatio ? "#14181F" : "#FFFFFF";
}

export type ReadabilityIssuePair = "page" | "button";

export interface ReadabilityIssue {
  pair: ReadabilityIssuePair;
  ratio: number;
  level: "warning" | "error";
  message: string;
}

/**
 * Evaluates theme colors against WCAG contrast thresholds.
 * Level "warning" when contrast is below 4.5:1.
 * Level "error" when contrast is below 3.0:1.
 * Handles solid, gradient (worse of both stops), and pattern (worse of base and 18% blend).
 */
export function getThemeReadabilityIssues(theme: ThemeConfig): ReadabilityIssue[] {
  const issues: ReadabilityIssue[] = [];

  // 1. Page text vs Page background
  const pageRatio = backgroundContrastRatio(theme.textColor, theme.background);
  if (pageRatio < 3.0) {
    issues.push({
      pair: "page",
      ratio: Math.round(pageRatio * 10) / 10,
      level: "error",
      message: "The page text is too hard to read on the background color.",
    });
  } else if (pageRatio < 4.5) {
    issues.push({
      pair: "page",
      ratio: Math.round(pageRatio * 10) / 10,
      level: "warning",
      message: `Page text contrast is low (${pageRatio.toFixed(1)}:1, aim for 4.5:1).`,
    });
  }

  // 2. Button text vs Button fill (solid / hard-shadow) OR vs Background (outline)
  const isOutline = theme.button.style === "outline";
  const buttonRatio = isOutline
    ? backgroundContrastRatio(theme.button.textColor, theme.background)
    : contrastRatio(theme.button.textColor, theme.button.fill);

  if (buttonRatio < 3.0) {
    issues.push({
      pair: "button",
      ratio: Math.round(buttonRatio * 10) / 10,
      level: "error",
      message: isOutline
        ? "The button text is too hard to read on the background color."
        : "The button text is too hard to read on the button color.",
    });
  } else if (buttonRatio < 4.5) {
    issues.push({
      pair: "button",
      ratio: Math.round(buttonRatio * 10) / 10,
      level: "warning",
      message: `Button text contrast is low (${buttonRatio.toFixed(1)}:1, aim for 4.5:1).`,
    });
  }

  return issues;
}
