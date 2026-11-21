import { db } from "@/server/db";
import { pages, blocks } from "@/server/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { usernameSchema } from "@/lib/validators/username";
import { detectPlatform } from "@/lib/platforms";
import { isTrustedImageUrl } from "@/server/storage";
import { unstable_cache } from "next/cache";

export const getPublicPageByUsername = unstable_cache(
  async (username: string) => {
    console.log(`[Cache Miss] Fetching public page for: ${username}`);
    return getPublicPageByUsernameUncached(username);
  },
  ["public-page"],
  {
    tags: ["page-data"], // We will invalidate this tag dynamically with the username
  }
);

// We wrap it in a helper to dynamically pass the username tag because unstable_cache 
// doesn't support dynamic tags inside the function signature natively without wrapper.
export async function getCachedPublicPage(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  return unstable_cache(
    async () => {
      return getPublicPageByUsernameUncached(cleanUsername);
    },
    [`public-page-${cleanUsername}`],
    { tags: [`page:${cleanUsername}`] }
  )();
}

export async function getPublicPageByUsernameUncached(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  
  // Validate before DB hit
  const result = usernameSchema.safeParse(cleanUsername);
  if (!result.success) return null;
  
  const page = await db.query.pages.findFirst({
    where: and(
      eq(sql`lower(${pages.username})`, cleanUsername),
      eq(pages.isPublished, true)
    ),
    columns: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      theme: true,
    },
  });

  if (!page) return null;

  // 1. Fetch visible link and header blocks
  const visibleBlocks = await db.query.blocks.findMany({
    where: and(
      eq(blocks.pageId, page.id),
      eq(blocks.isVisible, true),
      sql`${blocks.type} IN ('link', 'header')`
    ),
    columns: {
      id: true,
      type: true,
      title: true,
      url: true,
      layout: true,
      thumbnailUrl: true,
      thumbnailAlt: true,
      isHighlighted: true,
    },
    orderBy: [asc(blocks.position), asc(blocks.createdAt)],
  });

  const formattedItems = visibleBlocks.map((b) => {
    if (b.type === "header") {
      return {
        kind: "header" as const,
        id: b.id,
        title: b.title,
      };
    }
    return {
      kind: "link" as const,
      id: b.id,
      title: b.title,
      url: b.url || "",
      platform: detectPlatform(b.url || ""),
      layout: (b.layout as "classic" | "thumb" | "featured") || "classic",
      thumbnailUrl: isTrustedImageUrl(b.thumbnailUrl) ? b.thumbnailUrl : null,
      thumbnailAlt: b.thumbnailAlt || "",
      highlighted: Boolean(b.isHighlighted),
    };
  });

  // Backward compatible links array (links only)
  const formattedLinks = formattedItems
    .filter((item) => item.kind === "link")
    .map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      platform: item.platform,
      layout: item.layout,
      thumbnailUrl: item.thumbnailUrl,
      thumbnailAlt: item.thumbnailAlt,
      highlighted: item.highlighted,
    }));

  // 2. Fetch visible social blocks
  const socialBlocks = await db.query.blocks.findMany({
    where: and(
      eq(blocks.pageId, page.id),
      eq(blocks.isVisible, true),
      eq(blocks.type, "social")
    ),
    columns: {
      id: true,
      platform: true,
      title: true,
    },
    orderBy: [asc(blocks.position), asc(blocks.createdAt)],
  });

  const formattedSocials = socialBlocks.map((s) => ({
    id: s.id,
    platform: s.platform || "website",
    label: s.title,
  }));

  return {
    username: page.username,
    displayName: page.displayName,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    theme: page.theme,
    items: formattedItems,
    links: formattedLinks,
    socials: formattedSocials,
  };
}
