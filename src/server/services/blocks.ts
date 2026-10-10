import { db } from "../db";
import { blocks } from "../db/schema";
import { eq, and, asc, count, sql, desc } from "drizzle-orm";
import { MAX_LINKS_PER_PAGE } from "@/lib/limits";

export async function listBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position), asc(blocks.createdAt));
}

export async function getBlocksWithClicks(pageId: string) {
  // Use sql to count clicks from click_events joined to blocks
  const result = await db
    .execute(sql`
      SELECT 
        b.*,
        COUNT(c.id) as click_count
      FROM blocks b
      LEFT JOIN click_events c ON b.id = c.block_id
      WHERE b.page_id = ${pageId}
      GROUP BY b.id
      ORDER BY b.position ASC, b.created_at ASC
    `);
  
  return result.rows.map(row => ({
    id: row.id as string,
    title: row.title as string,
    url: row.url as string,
    position: row.position as number,
    isVisible: row.is_visible as boolean,
    clickCount: Number(row.click_count || 0)
  }));
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

export async function setBlockVisibility(blockId: string, pageId: string, isVisible: boolean) {
  const result = await db
    .update(blocks)
    .set({
      isVisible,
      updatedAt: new Date(),
    })
    .where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)))
    .returning();

  return result.length > 0;
}

export function validateReorder(existingIds: string[], orderedIds: string[]) {
  if (existingIds.length !== orderedIds.length) {
    return { ok: false, code: "stale", message: "Your list was out of date. Refreshed." } as const;
  }
  const orderedSet = new Set(orderedIds);
  if (orderedSet.size !== orderedIds.length) {
    return { ok: false, code: "stale", message: "Duplicate entries detected. Refreshed." } as const;
  }
  
  const existingSet = new Set(existingIds);
  for (const id of orderedIds) {
    if (!existingSet.has(id)) {
      return { ok: false, code: "stale", message: "Your list was out of date. Refreshed." } as const;
    }
  }
  return { ok: true } as const;
}

export async function reorderBlocks(pageId: string, orderedIds: string[]) {
  const existingBlocks = await listBlocks(pageId);
  const existingIds = existingBlocks.map(b => b.id);
  
  const validation = validateReorder(existingIds, orderedIds);
  if (!validation.ok) {
    return validation;
  }

  if (orderedIds.length === 0) return { ok: true } as const;

  const cases = orderedIds.map((id, index) => {
    return sql`WHEN id = ${id} THEN (${1024 * (index + 1)})::integer`;
  });

  const query = sql`
    UPDATE ${blocks}
    SET position = CASE
      ${sql.join(cases, sql` `)}
      ELSE position
      END,
      updated_at = ${new Date()}
    WHERE page_id = ${pageId}
  `;

  await db.execute(query);
  return { ok: true } as const;
}
