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
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#FAF9F5] border-r-2 border-ink/10 fixed top-0 left-0 bottom-0 pt-6 pb-6 px-4 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="px-2 pb-6 border-b-2 border-ink/10 mb-6">
        <Logo className="text-2xl" />
      </div>

      <div className="flex-1">
        <Navigation />
      </div>

      {/* User Profile Card */}
      <div className="mt-auto pt-4 border-t-2 border-ink/10">
        <div className="flex items-center justify-between gap-2.5 p-2.5 bg-white rounded-2xl border-2 border-ink/10 shadow-2xs hover:border-ink/25 transition-all">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Avatar
                src={page.avatarUrl}
                fallback={nameToDisplay}
                size="md"
                className="ring-2 ring-forest/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-lime border-2 border-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading font-extrabold text-sm text-ink truncate leading-tight">
                {nameToDisplay}
              </span>
              <span
                className="text-[11px] font-mono text-forest truncate font-bold"
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
            className="w-8 h-8 rounded-full bg-cream border border-ink/15 hover:bg-lime hover:text-forest hover:border-forest flex items-center justify-center text-ink/75 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest shadow-2xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-forest stroke-[2.5]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
