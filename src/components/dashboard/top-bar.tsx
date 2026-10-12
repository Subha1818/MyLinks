import { Logo } from "@/components/landing/logo";
import { UserMenu } from "./user-menu";
import { CopyLinkButton } from "./copy-link-button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function TopBar({
  page,
}: {
  page: { displayName: string | null; username: string; avatarUrl: string | null };
}) {
  return (
    <header className="w-full lg:bg-transparent lg:mb-8">
      {/* Mobile Top Bar — static, part of the page flow */}
      <div className="flex lg:hidden items-center justify-between px-1 py-4">
        <Logo className="text-2xl" />
        <UserMenu page={page} />
      </div>

      {/* Desktop Top Bar Right Content - aligned with main content max-w */}
      <div className="hidden lg:flex items-center justify-end h-16 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 gap-3">
        <Link
          href={`/${page.username}`}
          target="_blank"
          className="inline-flex items-center justify-center font-bold rounded-full transition-all duration-150 cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 hover:-translate-y-[1px] active:translate-y-0 bg-white text-ink border border-hairline hover:bg-cream hover:border-ink/20 shadow-xs hover:shadow-sm h-10 px-4 text-sm gap-2"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>View my page</span>
        </Link>
        <CopyLinkButton username={page.username} variant="primary" size="40px" />
      </div>
    </header>
  );
}
