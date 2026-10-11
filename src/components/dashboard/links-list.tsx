"use client";

import { useState, useTransition, useId } from "react";
import { Plus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui/empty-state";
import {
  addBlockAction,
  editBlockAction,
  removeBlockAction,
  reorderBlocksAction,
  setBlockVisibilityAction,
} from "@/server/actions/blocks";
import { MAX_LINKS_PER_PAGE } from "@/lib/limits";
import { LinkRow, type LinkBlock } from "./link-row";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { usePageDraft } from "./PageDraftProvider";

export function LinksList({ initialLinks: _initialLinks }: { initialLinks: LinkBlock[] }) {
  const { draft, updateBlocks } = usePageDraft();
  const links = draft.blocks;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBlock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      updateBlocks(newLinks); // Optimistic update

      startTransition(async () => {
        const res = await reorderBlocksAction(newLinks.map((l) => l.id));
        if (!res.ok) {
          // Revert on error
          updateBlocks(links);
          if ((res as { code?: string }).code === "stale") {
            alert("Your list was out of date. Refreshed.");
            router.refresh();
          } else {
            alert(res.message || "Failed to reorder links");
          }
        }
      });
    }
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    const oldLinks = [...links];
    const newLinks = links.map((l) => (l.id === id ? { ...l, isVisible } : l));
    updateBlocks(newLinks); // Optimistic update

    startTransition(async () => {
      const res = await setBlockVisibilityAction(id, isVisible);
      if (!res.ok) {
        updateBlocks(oldLinks); // Revert on error
        alert(res.message || "Failed to change visibility");
      }
    });
  };

  const handleOpenModal = (link?: LinkBlock) => {
    if (link) {
      setEditingLink(link);
      setTitle(link.title);
      setUrl(link.url);
    } else {
      setEditingLink(null);
      setTitle("");
      setUrl("");
    }
    setError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setError(null);
      setFieldErrors({});
    }, 200);
  };

  const handleSave = () => {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload = { title, url };

      let res;
      if (editingLink) {
        res = await editBlockAction(editingLink.id, payload);
      } else {
        res = await addBlockAction(payload);
      }

      if (res.ok) {
        handleCloseModal();
      } else {
        setError(res.message || "An error occurred");
        if ("fieldErrors" in res && res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await removeBlockAction(id);
      if (res.ok) {
        setDeleteId(null);
      } else {
        alert(res.message || "Failed to delete link");
      }
    });
  };

  return (
    <>
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] sm:text-[24px] text-ink">
            Links
          </h2>
          <p className="text-sm text-ink/60 font-medium">
            Drag to reorder. Toggle switches to hide or show on your public page.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs sm:text-sm font-bold text-ink/60">
            {links.length} / {MAX_LINKS_PER_PAGE} links
          </div>
          <Button
            variant="primary"
            size="40px"
            onClick={() => handleOpenModal()}
            disabled={isPending || links.length >= MAX_LINKS_PER_PAGE}
          >
            <Plus className="w-4 h-4" />
            <span>Add link</span>
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No links yet"
          description="Add your first link to your profile and share everything you create with your audience."
          action={{
            label: "Add your first link",
            onClick: () => handleOpenModal(),
          }}
        />
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {links.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  onEdit={handleOpenModal}
                  onDelete={setDeleteId}
                  onToggleVisibility={handleToggleVisibility}
                  isDragDisabled={isPending || links.length < 2}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete this link?"
        maxWidth="sm"
      >
        <p className="text-ink/70 text-sm mb-6 leading-relaxed">
          This action will immediately remove the link from your public page and cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            size="40px"
            onClick={() => setDeleteId(null)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="40px"
            onClick={() => deleteId && handleDelete(deleteId)}
            isLoading={isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLink ? "Edit link" : "Add link"}
        maxWidth="md"
      >
        {error && (
          <div
            className="p-3 mb-6 text-sm text-tomato bg-tomato/10 border border-tomato/20 rounded-[16px] font-bold"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-5"
        >
          <FormField
            id="link-title"
            label="Title"
            error={fieldErrors.title?.[0]}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Portfolio"
              disabled={isPending}
              autoFocus
            />
          </FormField>

          <FormField
            id="link-url"
            label="URL"
            hint="Starts with https://"
            error={fieldErrors.url?.[0]}
          >
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isPending}
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-3 border-t border-hairline mt-6">
            <Button
              variant="secondary"
              size="40px"
              type="button"
              onClick={handleCloseModal}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="40px"
              type="submit"
              isLoading={isPending}
            >
              Save link
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
