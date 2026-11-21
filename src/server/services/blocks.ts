import { db } from "../db";
import { blocks } from "../db/schema";
import { eq, and, asc, count, sql } from "drizzle-orm";
import {
  MAX_LINKS_PER_PAGE,
  MAX_SOCIALS_PER_PAGE,
  MAX_WEBSITES_PER_PAGE,
  MAX_HEADERS_PER_PAGE,
  MAX_HIGHLIGHTED_PER_PAGE,
} from "@/lib/limits";
import { deleteThumbnailIfOwned } from "../storage";

export type BlockGroup = "link" | "social";

export async function listBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position), asc(blocks.createdAt));
}

export async function listLinkBlocks(pageId: string) {
  // Returns all blocks in the link/header stream
  return db
    .select()
    .from(blocks)
    .where(
      and(
        eq(blocks.pageId, pageId),
        sql`${blocks.type} IN ('link', 'header')`
      )
    )
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
  // Returns all blocks with click count and Step 7C fields
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
    url: (row.url as string) || null,
    thumbnailUrl: (row.thumbnail_url as string) || null,
    thumbnailAlt: (row.thumbnail_alt as string) || null,
    layout: (row.layout as "classic" | "thumb" | "featured") || "classic",
    isHighlighted: Boolean(row.is_highlighted),
    position: row.position as number,
    isVisible: row.is_visible as boolean,
    clickCount: Number(row.click_count || 0),
  }));
}

export async function countBlocks(pageId: string, groupOrType?: string) {
  if (groupOrType) {
    const result = await db
      .select({ count: count() })
      .from(blocks)
      .where(and(eq(blocks.pageId, pageId), eq(blocks.type, groupOrType)));
    return result[0].count;
  }
  const result = await db
    .select({ count: count() })
    .from(blocks)
    .where(eq(blocks.pageId, pageId));
  return result[0].count;
}

export async function countHighlightedBlocks(pageId: string, excludeBlockId?: string) {
  const conditions = [
    eq(blocks.pageId, pageId),
    eq(blocks.isHighlighted, true),
    eq(blocks.type, "link"),
  ];
  if (excludeBlockId) {
    conditions.push(sql`${blocks.id} <> ${excludeBlockId}`);
  }
  const result = await db
    .select({ count: count() })
    .from(blocks)
    .where(and(...conditions));
  return result[0].count;
}

export async function createBlock(
  pageId: string,
  data: {
    title: string;
    url: string;
    layout?: "classic" | "thumb" | "featured";
    isHighlighted?: boolean;
    thumbnailAlt?: string | null;
  }
) {
  // Check limit (only type = 'link')
  const currentCount = await countBlocks(pageId, "link");
  if (currentCount >= MAX_LINKS_PER_PAGE) {
    throw new Error(`Limit of ${MAX_LINKS_PER_PAGE} links reached`);
  }

  // Check spotlight limit
  if (data.isHighlighted) {
    const currentHighlighted = await countHighlightedBlocks(pageId);
    if (currentHighlighted >= MAX_HIGHLIGHTED_PER_PAGE) {
      throw new Error(`You can spotlight at most ${MAX_HIGHLIGHTED_PER_PAGE} links`);
    }
  }

  // Get max position among link + header blocks
  const existingStream = await listLinkBlocks(pageId);
  const maxPos =
    existingStream.length > 0
      ? existingStream[existingStream.length - 1].position
      : 0;
  const newPos = maxPos + 1024;

  const result = await db
    .insert(blocks)
    .values({
      pageId,
      type: "link",
      title: data.title,
      url: data.url,
      layout: data.layout || "classic",
      isHighlighted: data.isHighlighted || false,
      thumbnailAlt: data.thumbnailAlt || null,
      thumbnailUrl: null, // Only set by the thumbnail upload route
      position: newPos,
    })
    .returning();

  return result[0];
}

export async function createHeaderBlock(
  pageId: string,
  data: { title: string }
) {
  const currentCount = await countBlocks(pageId, "header");
  if (currentCount >= MAX_HEADERS_PER_PAGE) {
    throw new Error(`Limit of ${MAX_HEADERS_PER_PAGE} headers reached`);
  }

  const existingStream = await listLinkBlocks(pageId);
  const maxPos =
    existingStream.length > 0
      ? existingStream[existingStream.length - 1].position
      : 0;
  const newPos = maxPos + 1024;

  const result = await db
    .insert(blocks)
    .values({
      pageId,
      type: "header",
      title: data.title,
      url: null,
      position: newPos,
      isVisible: true,
      layout: "classic",
      isHighlighted: false,
    })
    .returning();

  return result[0];
}

export async function updateHeaderBlock(
  blockId: string,
  pageId: string,
  data: { title: string }
) {
  const result = await db
    .update(blocks)
    .set({
      title: data.title,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(blocks.id, blockId),
        eq(blocks.pageId, pageId),
        eq(blocks.type, "header")
      )
    )
    .returning();

  return result[0] || null;
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
  data: {
    title: string;
    url: string;
    layout?: "classic" | "thumb" | "featured";
    isHighlighted?: boolean;
    thumbnailAlt?: string | null;
  },
  userId?: string
) {
  // If spotlight requested, check limit
  if (data.isHighlighted) {
    const currentHighlighted = await countHighlightedBlocks(pageId, blockId);
    if (currentHighlighted >= MAX_HIGHLIGHTED_PER_PAGE) {
      throw new Error(`You can spotlight at most ${MAX_HIGHLIGHTED_PER_PAGE} links`);
    }
  }

  // Fetch current block
  const currentRows = await db
    .select()
    .from(blocks)
    .where(
      and(
        eq(blocks.id, blockId),
        eq(blocks.pageId, pageId),
        eq(blocks.type, "link")
      )
    )
    .limit(1);

  if (currentRows.length === 0) return null;
  const current = currentRows[0];

  // If layout is switching to 'classic' on a link that has an image, remove thumbnail and clean up blob
  let newThumbnailUrl = current.thumbnailUrl;
  let newThumbnailAlt = data.thumbnailAlt !== undefined ? data.thumbnailAlt : current.thumbnailAlt;
  const targetLayout = data.layout !== undefined ? data.layout : current.layout;

  if (targetLayout === "classic" && current.thumbnailUrl) {
    newThumbnailUrl = null;
    newThumbnailAlt = null;
    if (userId) {
      await deleteThumbnailIfOwned({ userId, url: current.thumbnailUrl });
    }
  }

  // Note: blocks_layout_image_check ensures layout <> 'classic' requires thumbnail_url IS NOT NULL.
  // If user attempts to set layout to 'thumb' or 'featured' without a thumbnail, reject.
  if (targetLayout !== "classic" && !newThumbnailUrl) {
    throw new Error("Thumbnail image is required for Thumbnail and Featured layouts");
  }

  const result = await db
    .update(blocks)
    .set({
      title: data.title,
      url: data.url,
      layout: targetLayout,
      isHighlighted: data.isHighlighted !== undefined ? data.isHighlighted : current.isHighlighted,
      thumbnailUrl: newThumbnailUrl,
      thumbnailAlt: newThumbnailAlt,
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

export async function removeThumbnail(
  blockId: string,
  pageId: string,
  userId?: string
) {
  const currentRows = await db
    .select()
    .from(blocks)
    .where(
      and(
        eq(blocks.id, blockId),
        eq(blocks.pageId, pageId),
        eq(blocks.type, "link")
      )
    )
    .limit(1);

  if (currentRows.length === 0) return false;
  const current = currentRows[0];

  if (current.thumbnailUrl && userId) {
    await deleteThumbnailIfOwned({ userId, url: current.thumbnailUrl });
  }

  await db
    .update(blocks)
    .set({
      thumbnailUrl: null,
      thumbnailAlt: null,
      layout: "classic",
      updatedAt: new Date(),
    })
    .where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)));

  return true;
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
  group?: BlockGroup,
  userId?: string
) {
  const conditions = [eq(blocks.id, blockId), eq(blocks.pageId, pageId)];
  if (group === "link") {
    conditions.push(sql`${blocks.type} IN ('link', 'header')`);
  } else if (group === "social") {
    conditions.push(eq(blocks.type, "social"));
  }

  const result = await db
    .delete(blocks)
    .where(and(...conditions))
    .returning({ id: blocks.id, thumbnailUrl: blocks.thumbnailUrl });

  if (result.length > 0 && result[0].thumbnailUrl && userId) {
    await deleteThumbnailIfOwned({ userId, url: result[0].thumbnailUrl });
  }

  return result.length > 0;
}

export async function setBlockVisibility(
  blockId: string,
  pageId: string,
  isVisible: boolean,
  group?: BlockGroup
) {
  const conditions = [eq(blocks.id, blockId), eq(blocks.pageId, pageId)];
  if (group === "link") {
    conditions.push(sql`${blocks.type} IN ('link', 'header')`);
  } else if (group === "social") {
    conditions.push(eq(blocks.type, "social"));
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
  const blockMap = new Map(existingBlocks.map((b) => [b.id, b.type]));

  if (group === "link") {
    // Valid types in link group: 'link' and 'header'
    for (const id of orderedIds) {
      const blockType = blockMap.get(id);
      if (blockType && blockType !== "link" && blockType !== "header") {
        return {
          ok: false,
          code: "wrong_group",
          message: "Block belongs to another group.",
        } as const;
      }
    }

    const groupBlocks = existingBlocks.filter(
      (b) => b.type === "link" || b.type === "header"
    );
    const groupIds = groupBlocks.map((b) => b.id);
    return validateReorder(groupIds, orderedIds);
  }

  // Social group
  for (const id of orderedIds) {
    const blockType = blockMap.get(id);
    if (blockType && blockType !== "social") {
      return {
        ok: false,
        code: "wrong_group",
        message: "Block belongs to another group.",
      } as const;
    }
  }

  const groupBlocks = existingBlocks.filter((b) => b.type === "social");
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
    WHERE page_id = ${pageId} AND id IN (${sql.join(
      orderedIds.map((id) => sql`${id}`),
      sql`, `
    )})
  `;

  await db.execute(query);
  return { ok: true } as const;
}

