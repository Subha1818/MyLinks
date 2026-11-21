"use server";

import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import {
  createBlock,
  updateBlock,
  deleteBlock,
  setBlockVisibility,
  reorderBlocks,
  createSocialBlock,
  updateSocialBlock,
  createHeaderBlock,
  updateHeaderBlock,
  removeThumbnail,
  type BlockGroup,
} from "@/server/services/blocks";
import {
  BlockSchema,
  EditBlockSchema,
  HeaderSchema,
  type BlockInput,
  type EditBlockInput,
  type HeaderInput,
} from "@/lib/validators/block";
import { SocialBlockSchema, type SocialBlockInput } from "@/lib/validators/social";
import { z } from "zod";
import { MAX_LINKS_PER_PAGE, MAX_SOCIALS_PER_PAGE } from "@/lib/limits";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath, revalidateTag } from "next/cache";

// ---------------------------------------------------------------------------
// Link Blocks Actions
// ---------------------------------------------------------------------------

export async function addBlockAction(data: BlockInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    // Rate limit
    const { success } = rateLimit(`add-block:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    // Validate
    const parsed = BlockSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // Get page
    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const created = await createBlock(page.id, parsed.data);

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true, id: created.id };
  } catch (err) {
    if (err instanceof Error && (err.message?.includes("Limit of") || err.message?.includes("spotlight at most"))) {
      return { ok: false, message: err.message };
    }
    console.error("[addBlockAction] Error:", err);
    return { ok: false, message: "Failed to add link" };
  }
}

export async function editBlockAction(blockId: string, data: EditBlockInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    // Rate limit
    const { success } = rateLimit(`edit-block:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    // Validate
    const parsed = EditBlockSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // Get page
    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const updated = await updateBlock(blockId, page.id, parsed.data, userId);
    if (!updated) {
      return { ok: false, message: "Link not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && (err.message?.includes("spotlight at most") || err.message?.includes("Thumbnail image is required"))) {
      return { ok: false, message: err.message };
    }
    console.error("[editBlockAction] Error:", err);
    return { ok: false, message: "Failed to update link" };
  }
}

export async function removeBlockAction(blockId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    // Rate limit
    const { success } = rateLimit(`del-block:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    // Get page
    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const deleted = await deleteBlock(blockId, page.id, "link", userId);
    if (!deleted) {
      return { ok: false, message: "Item not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[removeBlockAction] Error:", err);
    return { ok: false, message: "Failed to delete item" };
  }
}

export async function removeThumbnailAction(blockId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const removed = await removeThumbnail(blockId, page.id, userId);
    if (!removed) {
      return { ok: false, message: "Link not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[removeThumbnailAction] Error:", err);
    return { ok: false, message: "Failed to remove image" };
  }
}

// ---------------------------------------------------------------------------
// Header Blocks Actions
// ---------------------------------------------------------------------------

export async function addHeaderAction(data: HeaderInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`add-header:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const parsed = HeaderSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    await createHeaderBlock(page.id, parsed.data);

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message?.includes("Limit of")) {
      return { ok: false, message: err.message };
    }
    console.error("[addHeaderAction] Error:", err);
    return { ok: false, message: "Failed to add header" };
  }
}

export async function editHeaderAction(blockId: string, data: HeaderInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`edit-header:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const parsed = HeaderSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const updated = await updateHeaderBlock(blockId, page.id, parsed.data);
    if (!updated) {
      return { ok: false, message: "Header not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[editHeaderAction] Error:", err);
    return { ok: false, message: "Failed to update header" };
  }
}

export async function setBlockVisibilityAction(blockId: string, isVisible: boolean) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`vis-block:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const updated = await setBlockVisibility(blockId, page.id, isVisible, "link");
    if (!updated) {
      return { ok: false, message: "Link not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[setBlockVisibilityAction] Error:", err);
    return { ok: false, message: "Failed to update visibility" };
  }
}

// ---------------------------------------------------------------------------
// Social Blocks Actions
// ---------------------------------------------------------------------------

export async function addSocialBlockAction(data: SocialBlockInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`add-social:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const parsed = SocialBlockSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Invalid social icon input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    await createSocialBlock(page.id, parsed.data);

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    if (err instanceof Error) {
      return { ok: false, message: err.message };
    }
    console.error("[addSocialBlockAction] Error:", err);
    return { ok: false, message: "Failed to add social icon" };
  }
}

export async function editSocialBlockAction(blockId: string, data: SocialBlockInput) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`edit-social:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const parsed = SocialBlockSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Invalid social icon input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const updated = await updateSocialBlock(blockId, page.id, {
      url: parsed.data.url,
      title: parsed.data.title,
    });

    if (!updated) {
      return { ok: false, message: "Social block not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[editSocialBlockAction] Error:", err);
    return { ok: false, message: "Failed to update social icon" };
  }
}

export async function removeSocialBlockAction(blockId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`del-social:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const deleted = await deleteBlock(blockId, page.id, "social");
    if (!deleted) {
      return { ok: false, message: "Social block not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[removeSocialBlockAction] Error:", err);
    return { ok: false, message: "Failed to delete social icon" };
  }
}

export async function setSocialVisibilityAction(blockId: string, isVisible: boolean) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`vis-social:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const updated = await setBlockVisibility(blockId, page.id, isVisible, "social");
    if (!updated) {
      return { ok: false, message: "Social block not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[setSocialVisibilityAction] Error:", err);
    return { ok: false, message: "Failed to update visibility" };
  }
}

// ---------------------------------------------------------------------------
// Grouped Reordering Action
// ---------------------------------------------------------------------------

export async function reorderBlocksAction(params: {
  group: BlockGroup;
  orderedIds: string[];
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { group, orderedIds } = params;

    const { success } = rateLimit(
      `reorder-${group}:${userId}`,
      60,
      60 * 1000
    );
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const maxLimit = group === "social" ? MAX_SOCIALS_PER_PAGE : MAX_LINKS_PER_PAGE;
    const parsed = z
      .array(z.string().uuid())
      .max(maxLimit)
      .safeParse(orderedIds);

    if (!parsed.success) {
      return { ok: false, message: "Invalid input" };
    }

    // Check for duplicates
    const uniqueIds = new Set(parsed.data);
    if (uniqueIds.size !== parsed.data.length) {
      return { ok: false, message: "Duplicate ids" };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const result = await reorderBlocks(page.id, group, parsed.data);
    if (!result.ok) {
      return result; // contains ok: false, code: "stale", message: ...
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[reorderBlocksAction] Error:", err);
    return { ok: false, message: `Failed to reorder ${params.group}s` };
  }
}
