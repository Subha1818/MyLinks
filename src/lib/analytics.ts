export function parseDevice(userAgent: string | null): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!userAgent) return "unknown";

  const ua = userAgent.toLowerCase();

  // Basic tablet checks first
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }

  // Basic mobile checks
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(
      ua
    )
  ) {
    return "mobile";
  }

  // Basic desktop check - Windows, Mac, Linux
  if (/windows|macintosh|linux|cros/i.test(ua)) {
    return "desktop";
  }

  return "unknown";
}

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // empty UA is suspicious

  const ua = userAgent.toLowerCase();

  const botPattern = /bot|crawler|spider|facebookexternalhit|whatsapp|slackbot|twitterbot|telegrambot|linkedinbot|discordbot|preview/i;
  if (botPattern.test(ua)) return true;

  // curl-like tools without a browser-like string
  if (/^curl\/|^wget\/|^python-requests\/|^node-fetch\/|^undici/i.test(ua)) return true;

  return false;
}

export function sanitizeCountry(value: string | null): string | null {
  if (!value) return null;
  const country = value.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(country)) {
    return country;
  }
  return null;
}
