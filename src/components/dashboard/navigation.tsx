"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Palette, Settings } from "lucide-react";
import { StarSpinner } from "@/components/brand/StarLoader";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Links",
    href: "/dashboard",
    icon: LayoutDashboard,
    chipBg: "bg-lime",
    chipText: "text-forest",
    activeClass: "bg-lime text-forest border-2 border-forest/20 shadow-xs",
  },
  {
    name: "Appearance",
    href: "/dashboard/appearance",
    icon: Palette,
    chipBg: "bg-lilac",
    chipText: "text-[#3B1A4A]",
    activeClass: "bg-lilac text-[#3B1A4A] border-2 border-[#3B1A4A]/20 shadow-xs",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    chipBg: "bg-[#FF8024]",
    chipText: "text-white",
    activeClass: "bg-[#FF8024]/20 text-[#8C3400] border-2 border-[#FF8024]/40 shadow-xs",
  },
];

function NavLinkContent({
  item,
  isActive,
  isMobile,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  isMobile: boolean;
}) {
  const { pending } = useLinkStatus();
  const Icon = item.icon;

  return (
    <>
      {/* Colored icon chip */}
      <span
        className={cn(
          "rounded-full flex items-center justify-center shrink-0 transition-all",
          isMobile ? "w-6 h-6" : "w-8 h-8",
          isActive
            ? "bg-black/10 text-current"
            : cn(item.chipBg, item.chipText, "shadow-2xs")
        )}
        aria-hidden="true"
      >
        {pending ? (
          <StarSpinner size={isMobile ? 14 : 16} />
        ) : (
          <Icon className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
        )}
      </span>
      <span className="truncate">
        {pending && !isMobile ? "Opening..." : item.name}
      </span>
    </>
  );
}

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
                ? item.activeClass
                : "text-ink/75 hover:text-ink hover:bg-white hover:border-ink/15 border-2 border-transparent"
            )}
          >
            <NavLinkContent item={item} isActive={isActive} isMobile={isMobile} />
          </Link>
        );
      })}
    </nav>
  );
}
