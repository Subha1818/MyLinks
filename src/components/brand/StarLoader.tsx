"use client";

import { useState } from "react";
import { StarMark } from "./StarMark";
import { usePrefersReducedMotion } from "@/lib/use-scroll-progress";

export interface StarLoaderProps {
  variant?: "fullscreen" | "fill";
  className?: string;
  label?: string;
}

/**
 * Branded Star Loader component.
 *
 * Circle steps through lime, lilac, mustard, and mint while the star spins
 * with a playful squash-and-stretch rhythm. Interactive on hover/click.
 *
 * Fades in after 150ms to prevent flashing on fast navigations.
 * Shows "Still working..." if the wait exceeds ~3 seconds.
 */
export function StarLoader({
  variant = "fill",
  className = "",
  label,
}: StarLoaderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopped, setIsPopped] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleClick = () => {
    setIsPopped(true);
    setTimeout(() => setIsPopped(false), 250);
  };

  const containerClasses =
    variant === "fullscreen"
      ? "fixed inset-0 z-50 min-h-dvh bg-cream flex flex-col items-center justify-center p-4 animate-loader-fade-in"
      : `w-full h-full min-h-[220px] flex flex-col items-center justify-center p-4 animate-loader-fade-in ${className}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={containerClasses}
    >
      <span className="sr-only">Loading</span>

      {/* Interactive Circle Container */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        aria-label="Loading indicator"
        className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-forest/30 shadow-[4px_4px_0px_#14181F] flex items-center justify-center cursor-pointer transition-transform duration-200 animate-star-colors ${
          isPopped ? "scale-90" : "hover:scale-105 active:scale-95"
        }`}
      >
        <div
          className={`text-forest flex items-center justify-center ${
            prefersReducedMotion
              ? "animate-star-pulse"
              : isHovered
              ? "animate-star-playful-spin-fast"
              : "animate-star-playful-spin"
          }`}
        >
          <StarMark className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" />
        </div>
      </button>

      {/* Optional or Primary Label */}
      {label && (
        <p className="mt-4 text-sm font-bold text-ink/80 text-center font-heading">
          {label}
        </p>
      )}

      {/* 3s Delayed Secondary Line: Still working... */}
      <p className="mt-3 text-xs font-semibold text-ink/50 text-center animate-delayed-text">
        Still working...
      </p>
    </div>
  );
}

export interface StarSpinnerProps {
  className?: string;
  size?: number;
}

/**
 * Small inline continuous star spinner for buttons and interactive controls.
 */
export function StarSpinner({ className = "w-4 h-4", size }: StarSpinnerProps) {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={sizeStyle}
      aria-hidden="true"
    >
      <StarMark className="w-full h-full animate-star-spinner" />
    </span>
  );
}
