import { Logo } from "@/components/landing/logo";
import { Navigation } from "./navigation";
import { siteConfig } from "@/lib/site";
import { Avatar } from "@/components/ui/avatar";

export function Sidebar({
  page,
}: {
  page: { displayName: string | null; username: string; avatarUrl: string | null };
}) {
  const nameToDisplay = page.displayName || page.username;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-ink/10 fixed top-0 left-0 bottom-0 pt-8 pb-6 px-4">
      <div className="flex items-center justify-center mb-10 px-2">
        <Logo />
      </div>

      <div className="flex-1">
        <Navigation />
      </div>

      <div className="mt-auto pt-6 border-t border-ink/10 flex items-center gap-3 px-2">
        <Avatar
          src={page.avatarUrl}
          fallback={nameToDisplay}
          size="md"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm text-ink truncate">
            {nameToDisplay}
          </span>
          <span className="text-xs text-ink/50 truncate font-medium">
            {siteConfig.name.toLowerCase()}.com/{page.username}
          </span>
        </div>
      </div>
    </aside>
  );
}
