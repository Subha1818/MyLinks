"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, MousePointerClick, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type LinkBlock = {
  id: string;
  title: string;
  url: string;
  position: number;
  isVisible: boolean;
  clickCount?: number;
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
        "rounded-[20px] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-150 border border-hairline",
        isDragging && "shadow-xl scale-[1.02] ring-2 ring-forest",
        !link.isVisible && !isDragging && "opacity-75 bg-[#FAF9F5]"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        disabled={isDragDisabled}
        className={cn(
          "drag-handle w-8 h-8 rounded-lg flex items-center justify-center text-ink/40 hover:text-ink hover:bg-cream transition-colors touch-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
          isDragDisabled && "hidden"
        )}
        aria-label={`Drag to reorder ${link.title}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Colored icon chip */}
      <div
        className="w-10 h-10 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center shrink-0 border border-cobalt/10 shadow-2xs"
        aria-hidden="true"
      >
        <Link2 className="w-4 h-4 stroke-[2.5]" />
      </div>

      {/* Title & URL */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-ink truncate text-sm sm:text-base">
            {link.title}
          </p>
          {!link.isVisible && (
            <Badge variant="warning" size="sm">
              Hidden
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
          <p className="text-ink/60 text-xs sm:text-sm truncate max-w-[180px] sm:max-w-[280px]">
            {link.url}
          </p>
          <Badge variant="neutral" size="sm">
            <MousePointerClick className="w-3 h-3 text-ink/50" />
            <span>
              {link.clickCount === 1
                ? "1 click"
                : `${link.clickCount || 0} clicks`}
            </span>
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Switch
          checked={link.isVisible}
          onCheckedChange={(val) => onToggleVisibility(link.id, val)}
          ariaLabel={`Show ${link.title} on your page`}
        />

        <button
          type="button"
          onClick={() => onEdit(link)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink/50 hover:text-ink hover:bg-cream border border-transparent hover:border-hairline transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          aria-label={`Edit ${link.title}`}
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(link.id)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink/50 hover:text-tomato hover:bg-tomato/10 border border-transparent hover:border-tomato/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato"
          aria-label={`Delete ${link.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
