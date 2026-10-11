"use client";

import { useState } from "react";
import { Logo } from "@/components/landing/logo";
import { Navigation } from "./navigation";
import { Avatar } from "@/components/ui/avatar";
import { getPublicUrl, getPublicUrlDisplay } from "@/lib/urls";
import { Copy, Check } from "lucide-react";

export function Sidebar({
  page,
}: {
  page: { displayName: string | null; username: string; avatarUrl: string | null };
}) {
  const [copied, setCopied] = useState(false);
  const nameToDisplay = page.displayName || page.username;
  const publicUrlDisplay = getPublicUrlDisplay(page.username);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPublicUrl(page.username));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-hairline fixed top-0 left-0 bottom-0 pt-8 pb-6 px-4 z-30">
      <div className="flex items-center px-3 mb-10">
        <Logo className="text-3xl" />
      </div>

      <div className="flex-1">
        <Navigation />
      </div>

      <div className="mt-auto pt-5 border-t border-hairline flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            src={page.avatarUrl}
            fallback={nameToDisplay}
            size="md"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm text-ink truncate">
              {nameToDisplay}
            </span>
            <span
              className="text-xs text-ink/60 truncate font-medium"
              title={publicUrlDisplay}
            >
              {publicUrlDisplay}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy public link"}
          title={copied ? "Copied!" : "Copy link"}
          className="w-8 h-8 rounded-full border border-hairline hover:border-ink/20 hover:bg-cream flex items-center justify-center text-ink/70 hover:text-ink transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-forest" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}
