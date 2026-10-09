import { db } from "../db";
import { blocks } from "../db/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { MAX_LINKS_PER_PAGE } from "@/lib/limits";

export async function listBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position), asc(blocks.createdAt));
}

export async function countBlocks(pageId: string) {
  const result = await db
    .select({ count: count() })
    .from(blocks)
    .where(eq(blocks.pageId, pageId));
  return result[0].count;
}

export async function createBlock(pageId: string, data: { title: string; url: string }) {
  // Check limit
  const currentCount = await countBlocks(pageId);
  if (currentCount >= MAX_LINKS_PER_PAGE) {
    throw new Error(`Limit of ${MAX_LINKS_PER_PAGE} links reached`);
  }

  // Get max position
  const allBlocks = await listBlocks(pageId);
  const maxPos = allBlocks.length > 0 ? allBlocks[allBlocks.length - 1].position : 0;
  const newPos = maxPos + 1024;

  const result = await db.insert(blocks).values({
    pageId,
    title: data.title,
    url: data.url,
    position: newPos,
  }).returning();

  return result[0];
}

export async function updateBlock(
  blockId: string,
  pageId: string,
  data: { title: string; url: string }
) {
  const result = await db
    .update(blocks)
    .set({
      title: data.title,
      url: data.url,
      updatedAt: new Date(),
    })
    .where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)))
    .returning();

  return result[0] || null;
}

export async function deleteBlock(blockId: string, pageId: string) {
  const result = await db
    .delete(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)))
    .returning();

  return result.length > 0;
}
