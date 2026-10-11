"use client";

import React from "react";
import { useLinkStatus } from "next/link";
import { StarSpinner } from "@/components/brand/StarLoader";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "accent"
    | "secondary"
    | "ghost"
    | "danger"
    // Legacy aliases for backward compatibility
    | "dark"
    | "light"
    | "forest";
  size?: "40px" | "48px" | "sm" | "md" | "lg";
  loading?: boolean;
  isLoading?: boolean;
  pendingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "40px",
      type = "button",
      loading = false,
      isLoading = false,
      pendingText,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const linkStatus = useLinkStatus();
    const isPending = loading || isLoading || linkStatus.pending;

    // Normalise legacy variants
    const resolvedVariant =
      variant === "dark"
        ? "primary"
        : variant === "forest"
        ? "accent"
        : variant === "light"
        ? "secondary"
        : variant;

    // Normalise size
    const resolvedSize =
      size === "sm" ? "40px" : size === "md" ? "48px" : size;

    const baseStyles =
      "inline-flex items-center justify-center font-bold rounded-full transition-all duration-150 cursor-pointer select-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed hover:-translate-y-[1px] active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none";

    const variantStyles: Record<string, string> = {
      primary:
        "bg-ink text-cream hover:bg-black hover:text-white shadow-xs hover:shadow-md",
      accent:
        "bg-lime text-forest hover:bg-[#c9dd2f] shadow-xs hover:shadow-md",
      secondary:
        "bg-white text-ink border border-hairline hover:bg-cream hover:border-ink/20 shadow-xs hover:shadow-sm",
      ghost:
        "bg-transparent text-ink/70 hover:text-ink hover:bg-ink/5 shadow-none hover:shadow-none hover:-translate-y-0",
      danger:
        "bg-tomato text-white hover:bg-[#e64a27] shadow-xs hover:shadow-md",
    };

    const sizeStyles: Record<string, string> = {
      "40px": "h-10 px-4 text-sm gap-2",
      "48px": "h-12 px-6 text-base gap-2.5",
      lg: "h-14 px-8 text-lg gap-3",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isPending}
        aria-busy={isPending || undefined}
        className={cn(
          baseStyles,
          variantStyles[resolvedVariant] || variantStyles.primary,
          sizeStyles[resolvedSize] || sizeStyles["40px"],
          className
        )}
        {...props}
      >
        {isPending && <StarSpinner className="w-4 h-4 shrink-0" />}
        {isPending && pendingText ? pendingText : children}
      </button>
    );
  }
);

Button.displayName = "Button";
