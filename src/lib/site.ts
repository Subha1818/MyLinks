const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const urlObj = new URL(appUrl);
const domain = urlObj.host;

export const siteConfig = {
  name: "MyLinks",
  tagline: "Your link in bio, built your way.",
  domain,
  ctaLabel: "Create your own MyLinks",
  ctaSubtext: "Free. Ready in a minute.",
  description:
    "Join the new wave of creators. Claim your link in bio, customize your page in seconds, and share everything you create without the clutter.",
  links: {
    features: "#features",
    howItWorks: "#how-it-works",
    themes: "#themes",
    login: "/login",
  },
  reservedDomainPrefix: `${domain}/`,
} as const;

export type SiteConfig = typeof siteConfig;
