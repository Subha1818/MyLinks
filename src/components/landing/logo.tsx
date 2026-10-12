import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { StarMark } from "@/components/brand/StarMark";

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
      className={`group inline-flex items-center gap-2 font-heading text-2xl font-extrabold tracking-tight select-none ${className}`}
      aria-label={`${siteConfig.name} Home`}
    >
      <span className={textColor}>{siteConfig.name}</span>
      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-lime border-2 border-forest flex items-center justify-center shadow-[2px_2px_0px_#1F4D1A] group-hover:rotate-12 group-hover:scale-105 active:scale-95 transition-all duration-200 shrink-0">
        <StarMark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${markColor}`} />
      </span>
    </Link>
  );
}
