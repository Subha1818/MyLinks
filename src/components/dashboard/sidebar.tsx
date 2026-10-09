import { Logo } from "@/components/landing/logo";
import { Navigation } from "./navigation";
import { siteConfig } from "@/lib/site";

export function Sidebar({
  user,
  username,
}: {
  user: { name?: string | null; image?: string | null };
  username: string;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-ink/10 fixed top-0 left-0 bottom-0 pt-8 pb-6 px-4">
      <div className="flex items-center justify-center mb-10 px-2">
        <Logo />
      </div>

      <div className="flex-1">
        <Navigation />
      </div>

      <div className="mt-auto pt-6 border-t border-ink/10 flex items-center gap-3 px-2">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || username}
            className="w-10 h-10 rounded-full border border-ink/10 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-lime text-forest flex items-center justify-center font-bold text-sm">
            {user.name?.[0]?.toUpperCase() || username[0].toUpperCase()}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm text-ink truncate">
            {user.name || username}
          </span>
          <span className="text-xs text-ink/50 truncate font-medium">
            {siteConfig.name.toLowerCase()}.com/{username}
          </span>
        </div>
      </div>
    </aside>
  );
}
