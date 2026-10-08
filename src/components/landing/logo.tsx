import Link from "next/link";
import { siteConfig } from "@/lib/site";

interface LogoProps {
  className?: string;
  textColor?: string;
  markColor?: string;
}

export function Logo({
  className = "",
  textColor = "text-ink",
  markColor = "text-forest",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 font-heading text-2xl font-extrabold tracking-tight select-none ${className}`}
      aria-label={`${siteConfig.name} Home`}
    >
      <span className={textColor}>{siteConfig.name}</span>
      <svg
        className={`w-5 h-5 ${markColor} transition-transform duration-300 hover:rotate-45`}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L13.8 8.4L20.2 6.6L16 12L20.2 17.4L13.8 15.6L12 22L10.2 15.6L3.8 17.4L8 12L3.8 6.6L10.2 8.4L12 2Z" />
      </svg>
    </Link>
  );
}
