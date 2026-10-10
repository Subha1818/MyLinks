import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/api/"],
    },
    // We don't have a sitemap yet, but if we did:
    // sitemap: `${baseUrl}/sitemap.xml`,
  };
}
