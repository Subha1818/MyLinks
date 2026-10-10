/**
 * WCAG 2.1 Contrast Ratio calculations.
 * Specifications: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */

/**
 * Converts a 3-character or 6-character hex color code to sRGB channels [0-255].
 */
export function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace("#", "").trim();
  let fullHex = sanitized;
  if (sanitized.length === 3) {
    fullHex = sanitized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (fullHex.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const num = parseInt(fullHex, 16);
  if (isNaN(num)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Converts an 8-bit sRGB channel [0-255] to linear luminance component.
 */
function sRgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the WCAG 2.1 relative luminance of a hex color.
 * Result ranges from 0 (darkest black) to 1 (brightest white).
 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(sRgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the WCAG 2.1 contrast ratio between two hex colors.
 * Returns a value between 1 (no contrast) and 21 (black on white).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks whether the contrast ratio meets WCAG AA for normal text (>= 4.5:1).
 */
export function meetsWcagAa(hex1: string, hex2: string): boolean {
  return contrastRatio(hex1, hex2) >= 4.5;
}
