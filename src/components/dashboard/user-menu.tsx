"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu({
  page,
}: {
  page: { displayName: string | null; username: string; avatarUrl: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const nameToDisplay = page.displayName || page.username;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full overflow-hidden border border-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        aria-label="Open user menu"
        aria-expanded={isOpen}
      >
        <Avatar
          src={page.avatarUrl}
          fallback={nameToDisplay}
          size="sm"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-ink/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 border-b border-ink/5">
            <p className="font-bold text-sm text-ink truncate">{nameToDisplay}</p>
            <p className="text-xs text-ink/60 truncate mt-0.5">{siteConfig.name.toLowerCase()}.com/{page.username}</p>
          </div>
          <div className="py-2 flex flex-col">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink/70 hover:text-ink hover:bg-cream transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-coral hover:bg-coral/5 transition-colors text-left w-full disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
