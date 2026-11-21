import { isSafeHttpUrl } from "./safe-url";

export interface PlatformConfig {
  key: string;
  label: string;
  hosts: string[];
  acceptsHandle: boolean;
  placeholder: string;
  buildUrl?: (handle: string) => string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    key: "instagram",
    label: "Instagram",
    hosts: ["instagram.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://instagram.com/${h}`,
  },
  {
    key: "x",
    label: "X (Twitter)",
    hosts: ["x.com", "twitter.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://x.com/${h}`,
  },
  {
    key: "youtube",
    label: "YouTube",
    hosts: ["youtube.com", "youtu.be"],
    acceptsHandle: true,
    placeholder: "channel handle or link",
    buildUrl: (h) => `https://youtube.com/@${h}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    hosts: ["tiktok.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://tiktok.com/@${h}`,
  },
  {
    key: "github",
    label: "GitHub",
    hosts: ["github.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://github.com/${h}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    hosts: ["linkedin.com"],
    acceptsHandle: true,
    placeholder: "profile handle or link",
    buildUrl: (h) => `https://linkedin.com/in/${h}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    hosts: ["facebook.com", "fb.com", "fb.me"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://facebook.com/${h}`,
  },
  {
    key: "spotify",
    label: "Spotify",
    hosts: ["spotify.com"],
    acceptsHandle: false,
    placeholder: "https://open.spotify.com/...",
  },
  {
    key: "snapchat",
    label: "Snapchat",
    hosts: ["snapchat.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://snapchat.com/add/${h}`,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    hosts: ["pinterest.com", "pin.it"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://pinterest.com/${h}`,
  },
  {
    key: "discord",
    label: "Discord",
    hosts: ["discord.gg", "discord.com"],
    acceptsHandle: false,
    placeholder: "https://discord.gg/...",
  },
  {
    key: "twitch",
    label: "Twitch",
    hosts: ["twitch.tv"],
    acceptsHandle: true,
    placeholder: "channel name or link",
    buildUrl: (h) => `https://twitch.tv/${h}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    hosts: ["wa.me", "whatsapp.com"],
    acceptsHandle: true,
    placeholder: "Phone number (e.g. 1234567890)",
    buildUrl: (digits) => `https://wa.me/${digits}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    hosts: ["t.me", "telegram.me"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://t.me/${h}`,
  },
  {
    key: "threads",
    label: "Threads",
    hosts: ["threads.net", "threads.com"],
    acceptsHandle: false,
    placeholder: "https://threads.net/@...",
  },
  {
    key: "reddit",
    label: "Reddit",
    hosts: ["reddit.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://reddit.com/user/${h}`,
  },
  {
    key: "behance",
    label: "Behance",
    hosts: ["behance.net"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://behance.net/${h}`,
  },
  {
    key: "dribbble",
    label: "Dribbble",
    hosts: ["dribbble.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://dribbble.com/${h}`,
  },
  {
    key: "medium",
    label: "Medium",
    hosts: ["medium.com"],
    acceptsHandle: true,
    placeholder: "username or link",
    buildUrl: (h) => `https://medium.com/@${h}`,
  },
  {
    key: "website",
    label: "Website",
    hosts: [], // Generic public website
    acceptsHandle: false,
    placeholder: "https://yourwebsite.com",
  },
];

export function getPlatform(key: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.key === key);
}

/**
 * Checks if a hostname matches an allowed apex domain with strict dot-boundary check.
 * E.g. for "github.com":
 * - "github.com" -> true
 * - "www.github.com" -> true
 * - "gist.github.com" -> true
 * - "evilgithub.com" -> false
 * - "github.com.evil.com" -> false
 */
function hostMatchesApex(hostname: string, apex: string): boolean {
  const normHost = hostname.toLowerCase();
  const normApex = apex.toLowerCase();
  return normHost === normApex || normHost.endsWith(`.${normApex}`);
}

/**
 * Detects the platform key for a given URL.
 * Matches exact hostname with dot boundary. Returns null if unknown or invalid URL.
 */
export function detectPlatform(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      // If missing scheme, try prepend https://
      parsed = new URL(`https://${url}`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const hostname = parsed.hostname;
    for (const p of PLATFORMS) {
      if (p.key === "website") continue;
      for (const apex of p.hosts) {
        if (hostMatchesApex(hostname, apex)) {
          return p.key;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validates if a URL belongs to a given platform.
 * For 'website', returns true if isSafeHttpUrl(url).
 */
export function isUrlForPlatform(key: string, url: string): boolean {
  if (!url || !isSafeHttpUrl(url)) return false;
  if (key === "website") return true;

  const platform = getPlatform(key);
  if (!platform) return false;

  try {
    const parsed = new URL(url);
    return platform.hosts.some((apex) => hostMatchesApex(parsed.hostname, apex));
  } catch {
    return false;
  }
}

/**
 * Resolves a user input (handle or full URL) into a standard public URL for the platform.
 * Handle validation:
 * - Strip leading @
 * - Allow letters, digits, ., _, -, 1 to 50 chars, no slashes or spaces.
 * - If input looks like a URL (starts with http, or contains a dot followed by a slash), treat as full URL.
 * - For WhatsApp, input is digits only (international format).
 */
export function resolveSocialUrl(key: string, input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If input looks like a full URL
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\//.test(trimmed);

  if (looksLikeUrl) {
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  // Handle WhatsApp
  if (key === "whatsapp") {
    // Strip everything except digits
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return "";
    return `https://wa.me/${digits}`;
  }

  // If platform does not accept handle, prepend https:// if missing
  const platform = getPlatform(key);
  if (!platform || !platform.acceptsHandle || !platform.buildUrl) {
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  // Clean handle: strip leading @
  const handle = trimmed.replace(/^@+/, "");

  // Validate handle characters: letters, digits, ., _, -, length 1 to 50
  if (!/^[a-zA-Z0-9._-]{1,50}$/.test(handle)) {
    // Return as-is with https scheme so subsequent validator can reject with helpful message
    return `https://${trimmed}`;
  }

  return platform.buildUrl(handle);
}

