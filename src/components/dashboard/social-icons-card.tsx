"use client";

import { useState, useTransition, useId } from "react";
import { Plus, GripVertical, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import {
  PLATFORMS,
  getPlatform,
  resolveSocialUrl,
} from "@/lib/platforms";
import {
  addSocialBlockAction,
  editSocialBlockAction,
  removeSocialBlockAction,
  setSocialVisibilityAction,
  reorderBlocksAction,
} from "@/server/actions/blocks";
import { MAX_SOCIALS_PER_PAGE, MAX_WEBSITES_PER_PAGE } from "@/lib/limits";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { usePageDraft, type SocialBlock } from "./PageDraftProvider";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Sortable Social Chip
// ---------------------------------------------------------------------------
function SortableSocialChip({
  social,
  onOpenEdit,
}: {
  social: SocialBlock;
  onOpenEdit: (social: SocialBlock) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: social.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-full border border-hairline transition-all duration-150 cursor-pointer shadow-xs ${
        isDragging ? "ring-2 ring-forest scale-105 shadow-md bg-white z-20" : "bg-white hover:border-ink/20"
      } ${!social.isVisible && !isDragging ? "opacity-40" : ""}`}
      onClick={() => onOpenEdit(social)}
      title={`${social.title} (${social.isVisible ? "Visible" : "Hidden"})`}
    >
      {/* Drag handle icon indicator on hover */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cream border border-hairline text-ink/40 hover:text-ink hidden group-hover:flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xs z-10"
        title="Drag to reorder"
      >
        <GripVertical className="w-3 h-3" />
      </div>

      <PlatformIcon platformKey={social.platform} size={22} className="text-ink" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Social Icons Card
// ---------------------------------------------------------------------------
export function SocialIconsCard() {
  const router = useRouter();
  const dndId = useId();
  const { draft, updateSocials } = usePageDraft();
  const socials = draft.socials || [];

  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPlatformKey, setSelectedPlatformKey] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Edit / Delete state
  const [editingSocial, setEditingSocial] = useState<SocialBlock | null>(null);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

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
      const oldIndex = socials.findIndex((s) => s.id === active.id);
      const newIndex = socials.findIndex((s) => s.id === over.id);

      const newSocials = arrayMove(socials, oldIndex, newIndex);
      updateSocials(newSocials); // Optimistic update

      startTransition(async () => {
        const res = await reorderBlocksAction({
          group: "social",
          orderedIds: newSocials.map((s) => s.id),
        });
        if (!res.ok) {
          updateSocials(socials); // Revert
          if ((res as { code?: string }).code === "stale") {
            alert("Your social icons list was out of date. Refreshed.");
            router.refresh();
          } else {
            alert(res.message || "Failed to reorder social icons");
          }
        }
      });
    }
  };

  const handleOpenAdd = () => {
    setSelectedPlatformKey(null);
    setInputValue("");
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
    setSelectedPlatformKey(null);
    setInputValue("");
    setFormError(null);
  };

  const handleOpenEdit = (social: SocialBlock) => {
    setEditingSocial(social);
    setInputValue(social.url);
    setIsConfirmDelete(false);
    setFormError(null);
  };

  const handleCloseEdit = () => {
    setEditingSocial(null);
    setIsConfirmDelete(false);
    setFormError(null);
    setInputValue("");
  };

  // Live preview URL computation
  const activePlatform = selectedPlatformKey ? getPlatform(selectedPlatformKey) : null;
  const livePreviewUrl =
    activePlatform && inputValue.trim()
      ? resolveSocialUrl(activePlatform.key, inputValue)
      : "";

  const handleSaveAdd = () => {
    if (!selectedPlatformKey || !inputValue.trim()) {
      setFormError("Please select a platform and enter your handle or URL.");
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const res = await addSocialBlockAction({
        platform: selectedPlatformKey,
        input: inputValue,
      });

      if (res.ok) {
        handleCloseAdd();
      } else {
        setFormError(res.message || "Failed to add social icon");
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editingSocial || !inputValue.trim()) return;

    setFormError(null);
    startTransition(async () => {
      const res = await editSocialBlockAction(editingSocial.id, {
        platform: editingSocial.platform,
        input: inputValue,
      });

      if (res.ok) {
        handleCloseEdit();
      } else {
        setFormError(res.message || "Failed to update social icon");
      }
    });
  };

  const handleToggleVisibility = (isVisible: boolean) => {
    if (!editingSocial) return;

    const oldSocials = [...socials];
    const updated = socials.map((s) =>
      s.id === editingSocial.id ? { ...s, isVisible } : s
    );
    updateSocials(updated);
    setEditingSocial({ ...editingSocial, isVisible });

    startTransition(async () => {
      const res = await setSocialVisibilityAction(editingSocial.id, isVisible);
      if (!res.ok) {
        updateSocials(oldSocials);
        setEditingSocial(editingSocial);
        alert(res.message || "Failed to update visibility");
      }
    });
  };

  const handleDelete = () => {
    if (!editingSocial) return;

    startTransition(async () => {
      const res = await removeSocialBlockAction(editingSocial.id);
      if (res.ok) {
        handleCloseEdit();
      } else {
        alert(res.message || "Failed to delete social icon");
      }
    });
  };

  // Determine platform disabled states in add modal
  const isPlatformDisabled = (platformKey: string) => {
    if (platformKey === "website") {
      const websiteCount = socials.filter((s) => s.platform === "website").length;
      return websiteCount >= MAX_WEBSITES_PER_PAGE;
    }
    return socials.some((s) => s.platform === platformKey);
  };

  return (
    <div className="mt-8 bg-white border border-hairline rounded-[28px] p-6 sm:p-7 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-hairline gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl text-ink">
            Social icons
          </h2>
          <p className="text-xs sm:text-sm text-ink/60 font-medium mt-0.5">
            Display quick social links directly under your bio. Drag to reorder.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs sm:text-sm font-bold text-ink/60">
            {socials.length} / {MAX_SOCIALS_PER_PAGE}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            disabled={socials.length >= MAX_SOCIALS_PER_PAGE || isPending}
            className="gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add icon</span>
          </Button>
        </div>
      </div>

      {/* Body / Chips Grid */}
      <div className="pt-6">
        {socials.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-hairline rounded-2xl">
            <p className="text-sm font-bold text-ink/60">
              No social icons added yet.
            </p>
            <p className="text-xs text-ink/40 mt-1">
              Add your Instagram, X, YouTube, GitHub, or WhatsApp to show under your bio.
            </p>
          </div>
        ) : (
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={socials.map((s) => s.id)}
              strategy={rectSortingStrategy}
            >
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => (
                  <SortableSocialChip
                    key={social.id}
                    social={social}
                    onOpenEdit={handleOpenEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Add Icon Modal                                                    */}
      {/* ----------------------------------------------------------------- */}
      <Modal
        isOpen={isAddOpen}
        onClose={handleCloseAdd}
        title="Add social icon"
        maxWidth="lg"
      >
        <div className="space-y-6">
          {formError && (
            <div
              className="flex items-center gap-2 p-3 text-xs sm:text-sm font-bold text-tomato bg-tomato/10 border border-tomato/20 rounded-xl"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Platform Picker Grid */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink/70 mb-2.5">
              1. Choose a platform
            </label>
            <div
              role="radiogroup"
              aria-label="Social platform options"
              className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1"
            >
              {PLATFORMS.map((platform) => {
                const disabled = isPlatformDisabled(platform.key);
                const isSelected = selectedPlatformKey === platform.key;

                return (
                  <button
                    key={platform.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedPlatformKey(platform.key);
                      setFormError(null);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      disabled
                        ? "opacity-35 bg-cream/50 border-hairline cursor-not-allowed"
                        : isSelected
                        ? "border-forest bg-forest/10 ring-2 ring-forest shadow-xs font-bold"
                        : "border-hairline bg-white hover:border-ink/20 hover:bg-cream/40"
                    }`}
                  >
                    <PlatformIcon platformKey={platform.key} size={22} className="text-ink" />
                    <span className="text-[11px] font-bold text-ink mt-1.5 truncate max-w-full">
                      {platform.label}
                    </span>
                    {disabled && (
                      <span className="text-[9px] text-ink/40 font-medium mt-0.5">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Value Input */}
          {activePlatform && (
            <div className="space-y-2 pt-2 border-t border-hairline">
              <label
                htmlFor="social-input"
                className="block text-xs font-extrabold uppercase tracking-wider text-ink/70"
              >
                2. Enter your {activePlatform.acceptsHandle ? "handle or link" : "link"}
              </label>

              {activePlatform.key === "whatsapp" && (
                <div className="p-2.5 rounded-xl bg-mustard/15 border border-mustard/30 text-ink text-xs font-medium">
                  <strong>Notice:</strong> Anyone who visits your page can see this number.
                </div>
              )}

              <input
                id="social-input"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setFormError(null);
                }}
                placeholder={activePlatform.placeholder}
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-cream border border-hairline text-ink font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              />

              {livePreviewUrl && (
                <div className="flex items-center gap-1.5 text-xs text-forest font-bold pl-1">
                  <Check className="w-3.5 h-3.5" />
                  <span className="truncate">URL: {livePreviewUrl}</span>
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-hairline">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCloseAdd}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveAdd}
              disabled={!selectedPlatformKey || !inputValue.trim() || isPending}
              isLoading={isPending}
            >
              Save icon
            </Button>
          </div>
        </div>
      </Modal>

      {/* ----------------------------------------------------------------- */}
      {/* Edit / Delete Modal                                               */}
      {/* ----------------------------------------------------------------- */}
      {editingSocial && (
        <Modal
          isOpen={!!editingSocial}
          onClose={handleCloseEdit}
          title={`Edit ${editingSocial.title}`}
          maxWidth="md"
        >
          <div className="space-y-5">
            {formError && (
              <div
                className="flex items-center gap-2 p-3 text-xs sm:text-sm font-bold text-tomato bg-tomato/10 border border-tomato/20 rounded-xl"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Platform indicator badge */}
            <div className="flex items-center gap-3 p-3 bg-cream rounded-2xl border border-hairline">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-hairline shadow-2xs">
                <PlatformIcon platformKey={editingSocial.platform} size={22} className="text-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-sm text-ink">{editingSocial.title}</p>
                <p className="text-xs text-ink/50 truncate">{editingSocial.url}</p>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-social-input"
                className="block text-xs font-extrabold uppercase tracking-wider text-ink/70"
              >
                URL or Handle
              </label>
              <input
                id="edit-social-input"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-cream border border-hairline text-ink font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              />
            </div>

            {/* Show on page switch */}
            <div className="flex items-center justify-between p-3.5 bg-cream/70 rounded-2xl border border-hairline">
              <div>
                <span className="text-sm font-bold text-ink block">Show on page</span>
                <span className="text-xs text-ink/60">
                  Toggle whether this icon appears publicly under your bio.
                </span>
              </div>
              <Switch
                checked={editingSocial.isVisible}
                onCheckedChange={handleToggleVisibility}
                ariaLabel="Show social icon on page"
              />
            </div>

            {/* Danger Zone: Delete */}
            <div className="pt-3 border-t border-hairline">
              {isConfirmDelete ? (
                <div className="p-3 bg-tomato/10 border border-tomato/20 rounded-2xl flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-tomato">
                    Are you sure? This icon will be removed.
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfirmDelete(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isPending}
                      isLoading={isPending}
                    >
                      Confirm Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmDelete(true)}
                  className="text-xs font-bold text-tomato hover:underline cursor-pointer"
                >
                  Delete this icon
                </button>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex justify-end gap-3 border-t border-hairline">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCloseEdit}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!inputValue.trim() || isPending}
                isLoading={isPending}
              >
                Save changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

