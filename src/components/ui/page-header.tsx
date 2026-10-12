import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  variant?: "lime" | "lilac" | "mustard" | "orange";
  icon?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  variant = "lime",
  icon,
  className,
}: PageHeaderProps) {
  const variantStyles = {
    lime: {
      band: "bg-lime text-forest",
      circle: "bg-forest/10 text-forest",
      textDesc: "text-forest/80",
    },
    lilac: {
      band: "bg-lilac text-[#3B1A4A]",
      circle: "bg-[#3B1A4A]/10 text-[#3B1A4A]",
      textDesc: "text-[#3B1A4A]/80",
    },
    mustard: {
      band: "bg-mustard text-[#2A1B00]",
      circle: "bg-[#2A1B00]/10 text-[#2A1B00]",
      textDesc: "text-[#2A1B00]/80",
    },
    orange: {
      band: "bg-[#FF8024] text-[#2B0E00]",
      circle: "bg-[#2B0E00]/10 text-[#2B0E00]",
      textDesc: "text-[#2B0E00]/85",
    },
  }[variant];

  return (
    <div
      className={cn(
        "rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 mb-8 border border-black/5 shadow-xs flex flex-row items-center justify-between gap-4 transition-all",
        variantStyles.band,
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="font-heading font-extrabold text-[32px] sm:text-[40px] md:text-[48px] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-2 text-[15px] sm:text-[16px] font-medium leading-relaxed max-w-2xl",
              variantStyles.textDesc
            )}
          >
            {description}
          </p>
        )}
      </div>

      {icon && (
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 shadow-xs",
            variantStyles.circle
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
    </div>
  );
}
