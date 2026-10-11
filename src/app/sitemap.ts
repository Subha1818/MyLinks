import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const staticDate = new Date("2026-10-11T00:00:00.000Z");

  return [
    {
      url: baseUrl,
      lastModified: staticDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
