"use server";

import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { createBlock, updateBlock, deleteBlock, setBlockVisibility, reorderBlocks } from "@/server/services/blocks";
import { BlockSchema, type BlockInput } from "@/lib/validators/block";
import { z } from "zod";
import { MAX_LINKS_PER_PAGE } from "@/lib/limits";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath, revalidateTag } from "next/cache";

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

    await createBlock(page.id, parsed.data);

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message?.includes("Limit of")) {
      return { ok: false, message: err.message };
    }
    console.error("[addBlockAction] Error:", err);
    return { ok: false, message: "Failed to add link" };
  }
}

export async function editBlockAction(blockId: string, data: BlockInput) {
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

    const updated = await updateBlock(blockId, page.id, parsed.data);
    if (!updated) {
      return { ok: false, message: "Link not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
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

    const deleted = await deleteBlock(blockId, page.id);
    if (!deleted) {
      return { ok: false, message: "Link not found or not yours" };
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[removeBlockAction] Error:", err);
    return { ok: false, message: "Failed to delete link" };
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

    const updated = await setBlockVisibility(blockId, page.id, isVisible);
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

export async function reorderBlocksAction(orderedIds: string[]) {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Unauthorized" };
    }
    const userId = session.user.id;

    const { success } = rateLimit(`reorder-blocks:${userId}`, 60, 60 * 1000);
    if (!success) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const parsed = z.array(z.string().uuid()).max(MAX_LINKS_PER_PAGE).safeParse(orderedIds);
    if (!parsed.success) {
      return { ok: false, message: "Invalid input" };
    }
    
    // check for duplicates
    const uniqueIds = new Set(parsed.data);
    if (uniqueIds.size !== parsed.data.length) {
      return { ok: false, message: "Duplicate ids" };
    }

    const page = await getPageByUserId(userId);
    if (!page) {
      return { ok: false, message: "Page not found" };
    }

    const result = await reorderBlocks(page.id, parsed.data);
    if (!result.ok) {
      return result; // contains ok: false, code: "stale", message: ...
    }

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/${page.username}`, "page");
    revalidateTag(`page:${page.username.toLowerCase()}`, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[reorderBlocksAction] Error:", err);
    return { ok: false, message: "Failed to reorder links" };
  }
}
