"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Palette, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Links", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appearance", href: "/dashboard/appearance", icon: Palette },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
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
        "flex",
        isMobile ? "flex-row w-full justify-around" : "flex-col gap-2 w-full"
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
              "flex items-center gap-3 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-full",
              isMobile
                ? "flex-col gap-1 py-3 px-4 text-[10px] sm:text-xs"
                : "py-3 px-4 text-sm sm:text-base",
              isActive
                ? "bg-lime text-forest"
                : "text-ink/60 hover:text-ink hover:bg-ink/5"
            )}
          >
            <Icon className={cn(isMobile ? "w-5 h-5" : "w-5 h-5")} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
