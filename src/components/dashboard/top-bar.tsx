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
    <header className="sticky top-0 z-40 w-full bg-white lg:bg-transparent lg:border-none border-b border-ink/10 lg:static lg:mb-8">
      {/* Mobile Top Bar */}
      <div className="flex lg:hidden items-center justify-between px-4 h-16">
        <div className="scale-75 origin-left">
          <Logo />
        </div>
        <UserMenu page={page} />
      </div>

      {/* Desktop Top Bar Right Content */}
      <div className="hidden lg:flex items-center justify-end h-16 px-8 gap-3 w-full">
        <Link
          href={`/${page.username}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-white border border-ink/10 hover:border-ink/20 hover:bg-cream text-ink font-bold text-sm py-2.5 px-4 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <ExternalLink className="w-4 h-4" />
          View my page
        </Link>
        <CopyLinkButton username={page.username} />
      </div>
    </header>
  );
}
