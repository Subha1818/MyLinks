import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: readonly SegmentOption<T>[] | SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "rounded-[16px] bg-cream border border-hairline p-1 flex items-center gap-1 select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 font-bold rounded-[12px] transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1",
              size === "sm" ? "py-1.5 px-2.5 text-xs" : "py-2 px-3 text-sm",
              isSelected
                ? "bg-white text-ink shadow-xs"
                : "text-ink/60 hover:text-ink hover:bg-white/50"
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
