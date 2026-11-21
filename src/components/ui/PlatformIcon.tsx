import React from "react";
import { BRAND_ICON_PATHS } from "@/lib/brand-icons";
import { Link2, Globe } from "lucide-react";

interface PlatformIconProps {
  platformKey: string;
  size?: number;
  className?: string;
}

export function PlatformIcon({
  platformKey,
  size = 24,
  className = "",
}: PlatformIconProps) {
  // If platform is generic 'website', show Globe
  if (platformKey === "website") {
    return <Globe style={{ width: size, height: size }} className={className} aria-hidden="true" />;
  }

  const svgPath = BRAND_ICON_PATHS[platformKey];

  // If missing icon (e.g. LinkedIn or unknown), fallback to Lucide Link2
  if (!svgPath) {
    return <Link2 style={{ width: size, height: size }} className={className} aria-hidden="true" />;
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={svgPath} />
    </svg>
  );
}

