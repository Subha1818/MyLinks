import { db } from "../db";
import { blocks } from "../db/schema";
import { eq, and, asc, count, sql } from "drizzle-orm";
import {
  MAX_LINKS_PER_PAGE,
  MAX_SOCIALS_PER_PAGE,
  MAX_WEBSITES_PER_PAGE,
} from "@/lib/limits";

export type BlockGroup = "link" | "social";

export async function listBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position), asc(blocks.createdAt));
}

export async function listLinkBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(and(eq(blocks.pageId, pageId), eq(blocks.type, "link")))
    .orderBy(asc(blocks.position), asc(blocks.createdAt));
}

export async function listSocialBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(and(eq(blocks.pageId, pageId), eq(blocks.type, "social")))
    .orderBy(asc(blocks.position), asc(blocks.createdAt));
}

export async function getBlocksWithClicks(pageId: string) {
  // Returns all blocks with click count
  const result = await db.execute(sql`
    SELECT 
      b.*,
      COUNT(c.id) as click_count
    FROM blocks b
    LEFT JOIN click_events c ON b.id = c.block_id
    WHERE b.page_id = ${pageId}
    GROUP BY b.id
    ORDER BY b.position ASC, b.created_at ASC
  `);

  return result.rows.map((row) => ({
    id: row.id as string,
    type: (row.type as string) || "link",
    platform: (row.platform as string) || null,
    title: row.title as string,
    url: row.url as string,
    position: row.position as number,
    isVisible: row.is_visible as boolean,
    clickCount: Number(row.click_count || 0),
  }));
}

export async function countBlocks(pageId: string, group?: BlockGroup) {
  if (group) {
    const result = await db
      .select({ count: count() })
      .from(blocks)
      .where(and(eq(blocks.pageId, pageId), eq(blocks.type, group)));
    return result[0].count;
  }
  const result = await db
    .select({ count: count() })
    .from(blocks)
    .where(eq(blocks.pageId, pageId));
  return result[0].count;
}

export async function createBlock(
  pageId: string,
  data: { title: string; url: string }
) {
  // Check limit (only type = 'link')
  const currentCount = await countBlocks(pageId, "link");
  if (currentCount >= MAX_LINKS_PER_PAGE) {
    throw new Error(`Limit of ${MAX_LINKS_PER_PAGE} links reached`);
  }

  // Get max position among link blocks
  const existingLinks = await listLinkBlocks(pageId);
  const maxPos =
    existingLinks.length > 0
      ? existingLinks[existingLinks.length - 1].position
      : 0;
  const newPos = maxPos + 1024;

  const result = await db
    .insert(blocks)
    .values({
      pageId,
      type: "link",
      title: data.title,
      url: data.url,
      position: newPos,
    })
    .returning();

  return result[0];
}

export async function createSocialBlock(
  pageId: string,
  data: { platform: string; url: string; title: string }
) {
  const currentSocials = await listSocialBlocks(pageId);
  if (currentSocials.length >= MAX_SOCIALS_PER_PAGE) {
    throw new Error(`Limit of ${MAX_SOCIALS_PER_PAGE} social icons reached`);
  }

  // One per platform rule, except 'website' which may appear up to 3 times
  if (data.platform === "website") {
    const websiteCount = currentSocials.filter((s) => s.platform === "website").length;
    if (websiteCount >= MAX_WEBSITES_PER_PAGE) {
      throw new Error(`Limit of ${MAX_WEBSITES_PER_PAGE} websites reached`);
    }
  } else {
    const alreadyExists = currentSocials.some((s) => s.platform === data.platform);
    if (alreadyExists) {
      throw new Error(`You have already added an icon for this platform.`);
    }
  }

  const maxPos =
    currentSocials.length > 0
      ? currentSocials[currentSocials.length - 1].position
      : 0;
  const newPos = maxPos + 1024;

  const result = await db
    .insert(blocks)
    .values({
      pageId,
      type: "social",
      platform: data.platform,
      title: data.title,
      url: data.url,
      position: newPos,
      isVisible: true,
    })
    .returning();

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
    .where(
      and(
        eq(blocks.id, blockId),
        eq(blocks.pageId, pageId),
        eq(blocks.type, "link")
      )
    )
    .returning();

  return result[0] || null;
}

export async function updateSocialBlock(
  blockId: string,
  pageId: string,
  data: { url: string; title: string; isVisible?: boolean }
) {
  const result = await db
    .update(blocks)
    .set({
      url: data.url,
      title: data.title,
      ...(data.isVisible !== undefined ? { isVisible: data.isVisible } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(blocks.id, blockId),
        eq(blocks.pageId, pageId),
        eq(blocks.type, "social")
      )
    )
    .returning();

  return result[0] || null;
}

export async function deleteBlock(
  blockId: string,
  pageId: string,
  group?: BlockGroup
) {
  const conditions = [eq(blocks.id, blockId), eq(blocks.pageId, pageId)];
  if (group) {
    conditions.push(eq(blocks.type, group));
  }

  const result = await db
    .delete(blocks)
    .where(and(...conditions))
    .returning();

  return result.length > 0;
}

export async function setBlockVisibility(
  blockId: string,
  pageId: string,
  isVisible: boolean,
  group?: BlockGroup
) {
  const conditions = [eq(blocks.id, blockId), eq(blocks.pageId, pageId)];
  if (group) {
    conditions.push(eq(blocks.type, group));
  }

  const result = await db
    .update(blocks)
    .set({
      isVisible,
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning();

  return result.length > 0;
}

export function validateReorder(existingIds: string[], orderedIds: string[]) {
  if (existingIds.length !== orderedIds.length) {
    return {
      ok: false,
      code: "stale",
      message: "Your list was out of date. Refreshed.",
    } as const;
  }
  const orderedSet = new Set(orderedIds);
  if (orderedSet.size !== orderedIds.length) {
    return {
      ok: false,
      code: "stale",
      message: "Duplicate entries detected. Refreshed.",
    } as const;
  }

  const existingSet = new Set(existingIds);
  for (const id of orderedIds) {
    if (!existingSet.has(id)) {
      return {
        ok: false,
        code: "stale",
        message: "Your list was out of date. Refreshed.",
      } as const;
    }
  }
  return { ok: true } as const;
}

export function validateGroupedReorder(
  existingBlocks: { id: string; type: string }[],
  group: BlockGroup,
  orderedIds: string[]
) {
  // Check if any passed ID belongs to a different block group (wrong group)
  const blockMap = new Map(existingBlocks.map((b) => [b.id, b.type]));
  for (const id of orderedIds) {
    const blockType = blockMap.get(id);
    if (blockType && blockType !== group) {
      return {
        ok: false,
        code: "wrong_group",
        message: "Block belongs to another group.",
      } as const;
    }
  }

  // Exact set matching against that group's blocks
  const groupBlocks = existingBlocks.filter((b) => b.type === group);
  const groupIds = groupBlocks.map((b) => b.id);
  return validateReorder(groupIds, orderedIds);
}

export async function reorderBlocks(
  pageId: string,
  groupOrParams: BlockGroup | { group: BlockGroup; orderedIds: string[] },
  maybeOrderedIds?: string[]
) {
  const group: BlockGroup =
    typeof groupOrParams === "object" ? groupOrParams.group : groupOrParams;
  const orderedIds: string[] =
    typeof groupOrParams === "object"
      ? groupOrParams.orderedIds
      : maybeOrderedIds || [];

  const allPageBlocks = await listBlocks(pageId);
  const validation = validateGroupedReorder(allPageBlocks, group, orderedIds);
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
    WHERE page_id = ${pageId} AND type = ${group}
  `;

  await db.execute(query);
  return { ok: true } as const;
}
