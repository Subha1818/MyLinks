"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Palette, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Links",
    href: "/dashboard",
    icon: LayoutDashboard,
    chipBg: "bg-lime",
    chipText: "text-forest",
  },
  {
    name: "Appearance",
    href: "/dashboard/appearance",
    icon: Palette,
    chipBg: "bg-lilac",
    chipText: "text-[#3B1A4A]",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    chipBg: "bg-mustard",
    chipText: "text-[#2A1B00]",
  },
];

export function Navigation({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex select-none",
        isMobile ? "flex-row w-full justify-around items-center" : "flex-col gap-2 w-full"
      )}
      aria-label="Dashboard Navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center font-bold rounded-full transition-all duration-150 cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2",
              isMobile
                ? "flex-col justify-center gap-1 min-h-[48px] py-1.5 px-3 text-[11px] sm:text-xs"
                : "gap-3 py-2.5 px-3.5 text-sm sm:text-base hover:-translate-y-[0.5px]",
              isActive
                ? "bg-lime text-forest shadow-xs"
                : "text-ink/70 hover:text-ink hover:bg-cream"
            )}
          >
            {/* Colored icon chip */}
            <span
              className={cn(
                "rounded-full flex items-center justify-center shrink-0 transition-all",
                isMobile ? "w-6 h-6" : "w-8 h-8",
                isActive
                  ? "bg-forest/15 text-forest"
                  : cn(item.chipBg, item.chipText, "shadow-2xs")
              )}
              aria-hidden="true"
            >
              <Icon className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
            </span>
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
