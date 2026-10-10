"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded" | "square";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
};

const shapeClasses = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-none",
};

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  shape = "circle",
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const showFallback = !src || imgError;
  const initial = fallback.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative overflow-hidden flex-shrink-0 border border-ink/10 bg-cream",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center bg-lime text-forest font-bold">
          {initial}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}
