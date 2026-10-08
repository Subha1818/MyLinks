export const siteConfig = {
  name: "MyLinks",
  tagline: "Your link in bio, built your way.",
  domain: "mylinks.to",
  description:
    "Join the new wave of creators. Claim your link in bio, customize your page in seconds, and share everything you create without the clutter.",
  links: {
    features: "#features",
    howItWorks: "#how-it-works",
    themes: "#themes",
    login: "/login",
  },
  reservedDomainPrefix: "mylinks.to/",
} as const;

export type SiteConfig = typeof siteConfig;
