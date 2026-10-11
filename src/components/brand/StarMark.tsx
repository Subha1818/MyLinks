import React from "react";

export interface StarMarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Reusable brand star mark component extracted from the MyLinks logo.
 * 8-pointed geometric faceted star.
 */
export function StarMark({
  className = "w-5 h-5 text-forest",
  ...props
}: StarMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 2L13.8 8.4L20.2 6.6L16 12L20.2 17.4L13.8 15.6L12 22L10.2 15.6L3.8 17.4L8 12L3.8 6.6L10.2 8.4L12 2Z" />
    </svg>
  );
}
