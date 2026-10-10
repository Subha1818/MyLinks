import { contrastRatio } from "./contrast";
import { ThemeConfig } from "./theme";

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
 * Returns #14181F or #FFFFFF, whichever has higher contrast on the given background color.
 */
export function readableTextOn(bg: string): "#14181F" | "#FFFFFF" {
  const normBg = normalizeHex(bg) || "#FFFFFF";
  const darkRatio = contrastRatio("#14181F", normBg);
  const lightRatio = contrastRatio("#FFFFFF", normBg);
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
 */
export function getThemeReadabilityIssues(theme: ThemeConfig): ReadabilityIssue[] {
  const issues: ReadabilityIssue[] = [];

  // 1. Page text vs Page background
  const pageRatio = contrastRatio(theme.textColor, theme.background.value);
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
  const buttonBg = isOutline ? theme.background.value : theme.button.fill;
  const buttonRatio = contrastRatio(theme.button.textColor, buttonBg);

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
