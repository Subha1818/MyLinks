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
      className={`inline-flex items-center gap-1.5 font-heading text-2xl font-extrabold tracking-tight select-none ${className}`}
      aria-label={`${siteConfig.name} Home`}
    >
      <span className={textColor}>{siteConfig.name}</span>
      <StarMark className={`w-5 h-5 ${markColor} transition-transform duration-300 hover:rotate-45`} />
    </Link>
  );
}
