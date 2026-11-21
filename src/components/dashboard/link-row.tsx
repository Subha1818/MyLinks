"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, MousePointerClick } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { detectPlatform } from "@/lib/platforms";

export type LinkBlock = {
  id: string;
  type?: "link" | "header" | "social";
  title: string;
  url?: string | null;
  position: number;
  isVisible: boolean;
  clickCount?: number;
  platform?: string | null;
  layout?: "classic" | "thumb" | "featured";
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  isHighlighted?: boolean;
};

interface LinkRowProps {
  link: LinkBlock;
  onEdit: (link: LinkBlock) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  isDragDisabled: boolean;
}

export function LinkRow({
  link,
  onEdit,
  onDelete,
  onToggleVisibility,
  isDragDisabled,
}: LinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-[20px] p-4 flex items-center gap-3 transition-all duration-150 border border-hairline bg-white",
        isDragging && "shadow-xl scale-[1.02] ring-2 ring-forest",
        !link.isVisible && !isDragging && "opacity-60 bg-[#FAF9F5]"
      )}
    >
      {/* Drag handle — hidden on mobile to save space */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        disabled={isDragDisabled}
        className={cn(
          "drag-handle hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-ink/40 hover:text-ink hover:bg-cream transition-colors touch-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
          isDragDisabled && "sm:hidden"
        )}
        aria-label={`Drag to reorder ${link.title}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Media: 40px thumbnail or platform icon chip or header indicator */}
      {link.type === "header" ? null : link.thumbnailUrl ? (
        <img
          src={link.thumbnailUrl}
          alt={link.thumbnailAlt || ""}
          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-hairline shadow-2xs"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-2xl bg-ink/[0.04] text-ink/70 flex items-center justify-center shrink-0 border border-hairline shadow-2xs"
          aria-hidden="true"
        >
          <PlatformIcon
            platformKey={link.platform || detectPlatform(link.url || "") || "website"}
            size={20}
          />
        </div>
      )}

      {/* Title & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn("text-ink text-sm sm:text-base truncate", link.type === "header" ? "font-extrabold text-base sm:text-lg" : "font-bold")}>
            {link.title}
          </p>
          {link.type === "header" && (
            <Badge variant="neutral" size="sm">
              Header
            </Badge>
          )}
          {link.isHighlighted && link.type !== "header" && (
            <Badge variant="forest" size="sm">
              Spotlight
            </Badge>
          )}
          {!link.isVisible && (
            <Badge variant="warning" size="sm">
              Hidden
            </Badge>
          )}
        </div>

        {/* Domain + clicks on one line (only for links) */}
        {link.type !== "header" && link.url && (
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-ink/50 text-xs truncate">
              {(() => {
                try {
                  return new URL(link.url).hostname.replace(/^www\./, "");
                } catch {
                  return link.url;
                }
              })()}
            </p>
            <span className="text-ink/30 text-xs">·</span>
            <span className="text-xs text-ink/50 font-medium whitespace-nowrap flex items-center gap-1">
              <MousePointerClick className="w-3 h-3 text-ink/40" />
              {link.clickCount === 1 ? "1" : `${link.clickCount || 0}`}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Switch
          checked={link.isVisible}
          onCheckedChange={(val) => onToggleVisibility(link.id, val)}
          ariaLabel={`Show ${link.title} on your page`}
        />

        <button
          type="button"
          onClick={() => onEdit(link)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:text-ink hover:bg-cream border border-transparent hover:border-hairline transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          aria-label={`Edit ${link.title}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(link.id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:text-tomato hover:bg-tomato/10 border border-transparent hover:border-tomato/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato"
          aria-label={`Delete ${link.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
