import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "neutral"
    | "lime"
    | "forest"
    | "mint"
    | "cobalt"
    | "warning"
    | "danger";
  size?: "sm" | "md";
}

export function Badge({
  variant = "neutral",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral: "bg-ink/10 text-ink/75",
    lime: "bg-lime text-forest",
    forest: "bg-forest text-lime",
    mint: "bg-mint text-forest",
    cobalt: "bg-cobalt text-white",
    warning: "bg-mustard/20 text-[#543800]",
    danger: "bg-tomato/15 text-tomato",
  }[variant];

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold rounded-full select-none tracking-tight",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
