/**
 * Social sharing and QR code helpers for MyLinks.
 */

export interface ShareOptions {
  url: string;
  title?: string;
  text?: string;
}

export function buildWhatsAppShareUrl(options: ShareOptions): string {
  const text = options.text ? `${options.text} ${options.url}` : options.url;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildXShareUrl(options: ShareOptions): string {
  const params = new URLSearchParams();
  params.set("url", options.url);
  if (options.text) {
    params.set("text", options.text);
  }
  return `https://x.com/intent/post?${params.toString()}`;
}

export function buildTelegramShareUrl(options: ShareOptions): string {
  const params = new URLSearchParams();
  params.set("url", options.url);
  if (options.text) {
    params.set("text", options.text);
  }
  return `https://t.me/share/url?${params.toString()}`;
}

export function buildEmailShareUrl(options: ShareOptions): string {
  const subject = options.title || "Check out my link in bio";
  const body = options.text ? `${options.text}\n\n${options.url}` : options.url;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * High-contrast QR code color presets.
 * All presets have contrast ratio >= 7:1 against #FFFFFF.
 */
export const QR_COLOR_PRESETS = [
  { id: "ink", label: "Ink", hex: "#14181F" },
  { id: "forest", label: "Forest", hex: "#1F4D1A" },
  { id: "cobalt", label: "Cobalt", hex: "#184CB8" },
  { id: "maroon", label: "Maroon", hex: "#7A0A1E" },
  { id: "tomato-dark", label: "Tomato Dark", hex: "#A32F15" },
] as const;

export type QrColorPresetId = (typeof QR_COLOR_PRESETS)[number]["id"];
