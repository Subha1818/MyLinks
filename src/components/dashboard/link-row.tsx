"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, MousePointerClick } from "lucide-react";
import { Card } from "./card";

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

export function LinkRow({ link, onEdit, onDelete, onToggleVisibility, isDragDisabled }: LinkRowProps) {
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
      className={`p-4 sm:p-5 flex items-center gap-3 transition-shadow ${
        isDragging ? "shadow-2xl scale-[1.02] ring-2 ring-ink/10" : ""
      } ${!link.isVisible && !isDragging ? "opacity-60" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        disabled={isDragDisabled}
        className={`drag-handle p-2 -ml-2 text-ink/40 hover:text-ink transition-colors rounded-lg touch-none ${
          isDragDisabled ? "hidden" : ""
        }`}
        aria-label={`Drag to reorder ${link.title}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className="font-bold text-ink truncate text-sm sm:text-base">
            {link.title}
          </p>
          {!link.isVisible && (
            <span className="px-2 py-0.5 bg-ink/10 text-ink/70 text-[10px] font-bold rounded-full tracking-wide uppercase">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-ink/60 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]">{link.url}</p>
          <div className="flex items-center gap-1 text-ink/50 text-xs font-medium">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>{link.clickCount === 1 ? "1 click" : `${link.clickCount || 0} clicks`}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <label className="relative inline-flex items-center cursor-pointer p-2">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={link.isVisible}
            onChange={(e) => onToggleVisibility(link.id, e.target.checked)}
            role="switch"
            aria-checked={link.isVisible}
            aria-label={`Show ${link.title} on your page`}
          />
          <div className="w-9 h-5 bg-ink/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[10px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ink"></div>
        </label>
        <button
          onClick={() => onEdit(link)}
          className="p-2 text-ink/50 hover:text-ink hover:bg-ink/5 rounded-lg transition-colors"
          aria-label={`Edit ${link.title}`}
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(link.id)}
          className="p-2 text-ink/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Delete ${link.title}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}
