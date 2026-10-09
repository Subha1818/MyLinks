import { db } from "@/server/db";
import { pages, blocks } from "@/server/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { usernameSchema } from "@/lib/validators/username";

export async function getPublicPageByUsername(username: string) {
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

  const pageBlocks = await db.query.blocks.findMany({
    where: and(
      eq(blocks.pageId, page.id),
      eq(blocks.isVisible, true),
      eq(blocks.type, "link")
    ),
    columns: {
      id: true,
      title: true,
      url: true,
    },
    orderBy: [asc(blocks.position), asc(blocks.createdAt)],
  });

  return {
    username: page.username,
    displayName: page.displayName,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    theme: page.theme,
    links: pageBlocks,
  };
}
