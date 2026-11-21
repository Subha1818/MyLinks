"use client";

import { useState, useTransition, useId, useCallback, useRef } from "react";
import { Plus, Link2, Heading, Sparkles, Upload, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import {
  addBlockAction,
  editBlockAction,
  removeBlockAction,
  reorderBlocksAction,
  setBlockVisibilityAction,
  addHeaderAction,
  editHeaderAction,
  removeThumbnailAction,
} from "@/server/actions/blocks";
import {
  MAX_LINKS_PER_PAGE,
  MAX_THUMBNAILS_PER_PAGE,
  MAX_HIGHLIGHTED_PER_PAGE,
  MAX_HEADERS_PER_PAGE,
} from "@/lib/limits";
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

function processClientImage(file: File): Promise<{ blob: Blob; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error("Image exceeds 5 MB limit"));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetAspect = 16 / 10;
        let cropW = img.width;
        let cropH = img.height;
        let cropX = 0;
        let cropY = 0;

        const currentAspect = img.width / img.height;
        if (currentAspect > targetAspect) {
          cropW = img.height * targetAspect;
          cropX = (img.width - cropW) / 2;
        } else {
          cropH = img.width / targetAspect;
          cropY = (img.height - cropH) / 2;
        }

        const outW = Math.min(1000, Math.round(cropW));
        const outH = Math.round(outW / targetAspect);

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not initialize canvas context"));

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Could not export webp"));
            const previewUrl = URL.createObjectURL(blob);
            resolve({ blob, previewUrl });
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function LinksList({ initialLinks: _ignored }: { initialLinks: LinkBlock[] }) {
  const { draft, updateBlocks } = usePageDraft();
  const links = draft.blocks;

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBlock | null>(null);
  const [editingHeader, setEditingHeader] = useState<LinkBlock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LinkBlock | null>(null);
  const [classicConfirmPending, setClassicConfirmPending] = useState(false);

  // Link Form State
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [layout, setLayout] = useState<"classic" | "thumb" | "featured">("classic");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [stagedImageBlob, setStagedImageBlob] = useState<Blob | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

  // Header Form State
  const [headerTitle, setHeaderTitle] = useState("");

  // Error States
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dndId = useId();

  // Derived Counts
  const linkOnlyBlocks = links.filter((l) => l.type !== "header");
  const headerOnlyBlocks = links.filter((l) => l.type === "header");

  const photosUsed = links.filter((l) => Boolean(l.thumbnailUrl)).length;
  const isEditingHasPhoto = Boolean(editingLink?.thumbnailUrl);
  const photosUsedElsewhere = isEditingHasPhoto ? photosUsed - 1 : photosUsed;
  const photoSlotAvailable = photosUsedElsewhere < MAX_THUMBNAILS_PER_PAGE;

  const spotlightUsed = links.filter((l) => Boolean(l.isHighlighted)).length;
  const isEditingHighlighted = Boolean(editingLink?.isHighlighted);
  const spotlightUsedElsewhere = isEditingHighlighted ? spotlightUsed - 1 : spotlightUsed;
  const spotlightSlotAvailable = spotlightUsedElsewhere < MAX_HIGHLIGHTED_PER_PAGE;

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
        const res = await reorderBlocksAction({
          group: "link",
          orderedIds: newLinks.map((l) => l.id),
        });
        if (!res.ok) {
          updateBlocks(links); // Revert
          if ((res as { code?: string }).code === "stale") {
            alert("Your list was out of date. Refreshed.");
            router.refresh();
          } else {
            alert(res.message || "Failed to reorder items");
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

  // Open Edit or Add Link Modal
  const handleOpenLinkModal = (link?: LinkBlock) => {
    if (link) {
      setEditingLink(link);
      setTitle(link.title);
      setUrl(link.url || "");
      setLayout(link.layout || "classic");
      setIsHighlighted(Boolean(link.isHighlighted));
      setExistingThumbnailUrl(link.thumbnailUrl || null);
    } else {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setLayout("classic");
      setIsHighlighted(false);
      setExistingThumbnailUrl(null);
    }
    setStagedImageBlob(null);
    setStagedPreviewUrl(null);
    setClassicConfirmPending(false);
    setError(null);
    setFieldErrors({});
    setIsLinkModalOpen(true);
  };

  const handleCloseLinkModal = useCallback(() => {
    setIsLinkModalOpen(false);
    setTimeout(() => {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setLayout("classic");
      setIsHighlighted(false);
      setStagedImageBlob(null);
      setStagedPreviewUrl(null);
      setExistingThumbnailUrl(null);
      setClassicConfirmPending(false);
      setError(null);
      setFieldErrors({});
    }, 200);
  }, []);

  // Open Header Modal
  const handleOpenHeaderModal = (headerBlock?: LinkBlock) => {
    if (headerBlock) {
      setEditingHeader(headerBlock);
      setHeaderTitle(headerBlock.title);
    } else {
      setEditingHeader(null);
      setHeaderTitle("");
    }
    setError(null);
    setFieldErrors({});
    setIsHeaderModalOpen(true);
  };

  const handleCloseHeaderModal = useCallback(() => {
    setIsHeaderModalOpen(false);
    setTimeout(() => {
      setEditingHeader(null);
      setHeaderTitle("");
      setError(null);
      setFieldErrors({});
    }, 200);
  }, []);

  // Generic Edit Dispatcher for rows
  const handleEditItem = (item: LinkBlock) => {
    if (item.type === "header") {
      handleOpenHeaderModal(item);
    } else {
      handleOpenLinkModal(item);
    }
  };

  // File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { blob, previewUrl } = await processClientImage(file);
      setStagedImageBlob(blob);
      setStagedPreviewUrl(previewUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove Thumbnail action
  const handleRemoveImageStaged = () => {
    setStagedImageBlob(null);
    setStagedPreviewUrl(null);
    setExistingThumbnailUrl(null);
    setLayout("classic");
  };

  // Save Link Handler
  const handleSaveLink = () => {
    setError(null);
    setFieldErrors({});

    // Check if layout needs an image
    if ((layout === "thumb" || layout === "featured") && !stagedImageBlob && !existingThumbnailUrl) {
      setError("Please choose or upload an image for this layout");
      return;
    }

    startTransition(async () => {
      // 1. If editing and user chose classic while an image existed, remove thumbnail
      if (editingLink && layout === "classic" && existingThumbnailUrl && !stagedImageBlob) {
        await removeThumbnailAction(editingLink.id);
      }

      // 2. Add or Edit link
      if (editingLink) {
        let finalThumbnailUrl = existingThumbnailUrl;

        // Upload new image FIRST if staged, so the thumbnail exists before layout constraint is checked
        if (stagedImageBlob) {
          const formData = new FormData();
          formData.append("file", stagedImageBlob, "thumbnail.webp");
          formData.append("blockId", editingLink.id);
          formData.append("layout", layout);

          try {
            const upRes = await fetch("/api/upload/thumbnail", {
              method: "POST",
              body: formData,
            });
            const upJson = await upRes.json();
            if (!upJson.ok) {
              setError(upJson.message || "Failed to upload image");
              return;
            }
            finalThumbnailUrl = upJson.url;
          } catch {
            setError("Failed to upload image. Please try again.");
            return;
          }
        }

        const payload = {
          title,
          url,
          layout,
          isHighlighted,
          thumbnailAlt: null,
        };

        const res = await editBlockAction(editingLink.id, payload);
        if (!res.ok) {
          setError(res.message || "Failed to update link");
          if ("fieldErrors" in res && res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
          return;
        }

        // Optimistically update draft blocks
        updateBlocks(
          links.map((l) =>
            l.id === editingLink.id
              ? {
                  ...l,
                  title,
                  url,
                  layout: layout === "classic" ? "classic" : layout,
                  thumbnailUrl: layout === "classic" ? null : finalThumbnailUrl,
                  thumbnailAlt: null,
                  isHighlighted,
                }
              : l
          )
        );

        router.refresh();
        handleCloseLinkModal();
      } else {
        // Creating NEW link
        const payload = {
          title,
          url,
          layout: "classic" as const, // created initially as classic per spec flow
          isHighlighted,
          thumbnailAlt: null,
        };

        const res = await addBlockAction(payload);
        if (!res.ok || !res.id) {
          setError(res.message || "Failed to add link");
          if ("fieldErrors" in res && res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
          return;
        }

        const newBlockId = res.id;
        let finalThumbnailUrl: string | null = null;
        let finalLayout: "classic" | "thumb" | "featured" = "classic";

        // Upload image if thumbnail or featured was chosen with image
        if (stagedImageBlob && (layout === "thumb" || layout === "featured")) {
          const formData = new FormData();
          formData.append("file", stagedImageBlob, "thumbnail.webp");
          formData.append("blockId", newBlockId);
          formData.append("layout", layout);

          try {
            const upRes = await fetch("/api/upload/thumbnail", {
              method: "POST",
              body: formData,
            });
            const upJson = await upRes.json();
            if (!upJson.ok) {
              alert(`Link was created, but photo upload failed: ${upJson.message || "Error"}. You can retry editing the link.`);
            } else {
              finalThumbnailUrl = upJson.url;
              finalLayout = layout;
            }
          } catch {
            alert("Link was created, but photo upload failed. You can retry from Edit.");
          }
        }

        updateBlocks([
          ...links,
          {
            id: newBlockId,
            type: "link",
            title,
            url,
            layout: finalLayout,
            thumbnailUrl: finalThumbnailUrl,
            thumbnailAlt: null,
            isHighlighted,
            isVisible: true,
            position: (links[links.length - 1]?.position || 0) + 1024,
          },
        ]);

        router.refresh();
        handleCloseLinkModal();
      }
    });
  };

  // Save Header Handler
  const handleSaveHeader = () => {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      let res;
      if (editingHeader) {
        res = await editHeaderAction(editingHeader.id, { title: headerTitle });
        if (res.ok) {
          updateBlocks(
            links.map((l) => (l.id === editingHeader.id ? { ...l, title: headerTitle } : l))
          );
          router.refresh();
          handleCloseHeaderModal();
        } else {
          setError(res.message || "Failed to save header");
          if ("fieldErrors" in res && res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } else {
        res = await addHeaderAction({ title: headerTitle });
        if (res.ok) {
          router.refresh();
          handleCloseHeaderModal();
        } else {
          setError(res.message || "Failed to save header");
          if ("fieldErrors" in res && res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      }
    });
  };

  // Delete Item Handler
  const handleDelete = (item: LinkBlock) => {
    startTransition(async () => {
      const res = await removeBlockAction(item.id);
      if (res.ok) {
        updateBlocks(links.filter((l) => l.id !== item.id));
        router.refresh();
        setDeleteTarget(null);
      } else {
        alert(res.message || "Failed to delete item");
      }
    });
  };

  const currentActiveImg = stagedPreviewUrl || existingThumbnailUrl;

  return (
    <>
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] sm:text-[24px] text-ink">
            Links &amp; Sections
          </h2>
          <p className="text-sm text-ink/60 font-medium">
            Drag to reorder links and section headers. Toggle switches to hide or show on your page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="text-xs sm:text-sm font-bold text-ink/60 whitespace-nowrap">
            {linkOnlyBlocks.length} / {MAX_LINKS_PER_PAGE} links
          </div>
          <Button
            variant="secondary"
            size="40px"
            onClick={() => handleOpenHeaderModal()}
            disabled={isPending || headerOnlyBlocks.length >= MAX_HEADERS_PER_PAGE}
            className="whitespace-nowrap shrink-0 px-3.5"
          >
            <Heading className="w-4 h-4 shrink-0" />
            <span>Add header</span>
          </Button>
          <Button
            variant="primary"
            size="40px"
            onClick={() => handleOpenLinkModal()}
            disabled={isPending || linkOnlyBlocks.length >= MAX_LINKS_PER_PAGE}
            className="whitespace-nowrap shrink-0 px-4"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add link</span>
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No links or headers yet"
          description="Add your first link or section header to organize everything you share with your audience."
          action={{
            label: "Add your first link",
            onClick: () => handleOpenLinkModal(),
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
                  onEdit={handleEditItem}
                  onDelete={() => setDeleteTarget(link)}
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
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.type === "header" ? "Delete this header?" : "Delete this link?"}
        maxWidth="sm"
      >
        <p className="text-ink/70 text-sm mb-6 leading-relaxed">
          This action will immediately remove the {deleteTarget?.type === "header" ? "header" : "link"} from your public page and cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            size="40px"
            onClick={() => setDeleteTarget(null)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="40px"
            onClick={() => deleteTarget && handleDelete(deleteTarget)}
            isLoading={isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Add / Edit Header Modal */}
      <Modal
        isOpen={isHeaderModalOpen}
        onClose={handleCloseHeaderModal}
        title={editingHeader ? "Edit section header" : "Add section header"}
        maxWidth="sm"
      >
        {error && (
          <div
            className="p-3 mb-5 text-sm text-tomato bg-tomato/10 border border-tomato/20 rounded-[16px] font-bold"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveHeader();
          }}
          className="space-y-5"
        >
          <FormField
            id="header-title"
            label="Section Title"
            hint="Displays as a bold heading on your page (1-60 characters)"
            error={fieldErrors.title?.[0]}
          >
            <Input
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="e.g. My Projects"
              disabled={isPending}
              maxLength={60}
              autoFocus
            />
          </FormField>

          {error && (
            <div
              className="p-3 text-sm text-tomato bg-tomato/10 border border-tomato/20 rounded-[16px] font-bold"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-hairline mt-6">
            <Button
              variant="secondary"
              size="40px"
              type="button"
              onClick={handleCloseHeaderModal}
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
              Save header
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Link Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={handleCloseLinkModal}
        title={editingLink ? "Edit link" : "Add link"}
        maxWidth="md"
      >
        {error && (
          <div
            className="p-3 mb-5 text-sm text-tomato bg-tomato/10 border border-tomato/20 rounded-[16px] font-bold"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {classicConfirmPending && (
          <div className="p-3.5 mb-5 text-sm bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-[16px] font-medium space-y-2">
            <p className="font-bold">Removing Photo</p>
            <p>Switching to Classic layout will remove this link&apos;s photo. Save changes to confirm.</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveLink();
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
              maxLength={60}
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

          {/* 1. Layout Picker */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Card Layout
              </label>
              <span className="text-xs font-bold text-ink/50">
                Photos used: {photosUsed} / {MAX_THUMBNAILS_PER_PAGE}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Classic */}
              <button
                type="button"
                onClick={() => {
                  setLayout("classic");
                  if (existingThumbnailUrl) setClassicConfirmPending(true);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                  layout === "classic"
                    ? "border-forest bg-forest/5 text-forest font-bold shadow-2xs"
                    : "border-hairline bg-white hover:border-ink/20 text-ink/70"
                }`}
              >
                <div className="w-12 h-6 rounded-md border border-current flex items-center justify-center px-1 mb-2">
                  <div className="w-6 h-1 bg-current rounded-full" />
                </div>
                <span className="text-xs font-bold">Classic</span>
              </button>

              {/* Thumbnail */}
              <button
                type="button"
                disabled={!photoSlotAvailable && !currentActiveImg}
                onClick={() => {
                  setLayout("thumb");
                  setClassicConfirmPending(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center ${
                  !photoSlotAvailable && !currentActiveImg
                    ? "opacity-40 cursor-not-allowed border-hairline bg-cream"
                    : layout === "thumb"
                    ? "border-forest bg-forest/5 text-forest font-bold shadow-2xs cursor-pointer"
                    : "border-hairline bg-white hover:border-ink/20 text-ink/70 cursor-pointer"
                }`}
              >
                <div className="w-12 h-6 rounded-md border border-current flex items-center gap-1 px-1 mb-2">
                  <div className="w-3.5 h-3.5 bg-current rounded-sm shrink-0" />
                  <div className="w-5 h-1 bg-current rounded-full" />
                </div>
                <span className="text-xs font-bold">Thumbnail</span>
              </button>

              {/* Featured */}
              <button
                type="button"
                disabled={!photoSlotAvailable && !currentActiveImg}
                onClick={() => {
                  setLayout("featured");
                  setClassicConfirmPending(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center ${
                  !photoSlotAvailable && !currentActiveImg
                    ? "opacity-40 cursor-not-allowed border-hairline bg-cream"
                    : layout === "featured"
                    ? "border-forest bg-forest/5 text-forest font-bold shadow-2xs cursor-pointer"
                    : "border-hairline bg-white hover:border-ink/20 text-ink/70 cursor-pointer"
                }`}
              >
                <div className="w-12 h-7 rounded-md border border-current flex flex-col overflow-hidden mb-1">
                  <div className="w-full h-3.5 bg-current" />
                  <div className="w-full h-3 flex items-center justify-center">
                    <div className="w-5 h-0.5 bg-current rounded-full" />
                  </div>
                </div>
                <span className="text-xs font-bold">Featured</span>
              </button>
            </div>

            {!photoSlotAvailable && !currentActiveImg && (
              <p className="text-xs font-medium text-tomato/90 mt-1">
                You&apos;ve used all 3 photo slots. Remove an image from another link to add one here.
              </p>
            )}
          </div>

          {/* 2. Image Section (When Thumbnail or Featured chosen) */}
          {(layout === "thumb" || layout === "featured") && (
            <div className="p-4 rounded-2xl bg-ink/[0.02] border border-hairline space-y-3.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="link-photo-input"
              />

              {currentActiveImg ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12.5 rounded-xl overflow-hidden border border-hairline shrink-0 bg-black/5 aspect-[16/10]">
                      <img
                        src={currentActiveImg}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImageStaged}
                        disabled={isPending}
                        className="text-tomato hover:text-tomato hover:bg-tomato/10"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-hairline hover:border-forest/50 rounded-2xl cursor-pointer bg-white transition-colors text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-forest/5 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-ink">Choose a photo</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    JPEG, PNG, or WebP up to 5 MB (center-cropped to 16:10)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Spotlight Switch */}
          <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl bg-cream border border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Spotlight this link</p>
                <p className="text-xs text-ink/60">
                  Adds a gentle attention effect to highlight your most important link
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-bold text-ink/50">
                {spotlightUsed} / {MAX_HIGHLIGHTED_PER_PAGE}
              </span>
              <Switch
                checked={isHighlighted}
                onCheckedChange={(val) => setIsHighlighted(val)}
                disabled={!spotlightSlotAvailable && !isHighlighted}
                ariaLabel="Spotlight this link"
              />
            </div>
          </div>

          {error && (
            <div
              className="p-3 text-sm text-tomato bg-tomato/10 border border-tomato/20 rounded-[16px] font-bold"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-hairline mt-6">
            <Button
              variant="secondary"
              size="40px"
              type="button"
              onClick={handleCloseLinkModal}
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
