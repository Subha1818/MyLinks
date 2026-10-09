"use server";

import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { createBlock, updateBlock, deleteBlock } from "@/server/services/blocks";
import { BlockSchema, type BlockInput } from "@/lib/validators/block";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

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
    revalidatePath(`/${page.username}`);

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
    revalidatePath(`/${page.username}`);

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
    revalidatePath(`/${page.username}`);

    return { ok: true };
  } catch (err) {
    console.error("[removeBlockAction] Error:", err);
    return { ok: false, message: "Failed to delete link" };
  }
}
