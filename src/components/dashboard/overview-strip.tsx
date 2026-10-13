"use client";

import { useState } from "react";
import { MousePointerClick, Eye, Globe, Copy, Check, ExternalLink } from "lucide-react";
import { getPublicUrl, getPublicUrlDisplay } from "@/lib/urls";

interface OverviewStripProps {
  username: string;
  totalClicks: number;
  visibleLinks: number;
  totalLinks: number;
}

export function OverviewStrip({
  username,
  totalClicks,
  visibleLinks,
  totalLinks,
}: OverviewStripProps) {
  const [copied, setCopied] = useState(false);
  const publicUrlDisplay = getPublicUrlDisplay(username);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPublicUrl(username));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <>
      {/* Mobile (< sm): 2 Stats in top row + Dedicated High-Visibility "Your Link" Action Bar */}
      <div className="flex sm:hidden flex-col gap-2.5 mb-6">
        {/* Row 1: The 2 Stat Pills */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Clicks */}
          <div className="flex items-center gap-2.5 bg-cobalt text-white rounded-2xl px-3.5 py-3 shadow-xs">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MousePointerClick className="w-4 h-4 text-white" />
            </span>
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-xl leading-none">
                {totalClicks.toLocaleString()}
              </div>
              <div className="text-[11px] text-white/80 font-medium mt-1 truncate">
                Total clicks
              </div>
            </div>
          </div>

          {/* Links Live */}
          <div className="flex items-center gap-2.5 bg-mint text-forest rounded-2xl px-3.5 py-3 shadow-xs">
            <span className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-forest" />
            </span>
            <div className="min-w-0">
              <div className="font-heading font-extrabold text-xl leading-none">
                {visibleLinks} / {totalLinks}
              </div>
              <div className="text-[11px] text-forest/80 font-medium mt-1 truncate">
                Links live
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Prominent "Your Link" Card with High-Contrast Copy Button */}
        <div className="flex items-center justify-between gap-2.5 bg-white border-2 border-forest/20 rounded-2xl p-2.5 shadow-xs">
          {/* Link info */}
          <div className="flex items-center gap-2.5 min-w-0 pl-1">
            <span className="w-8 h-8 rounded-full bg-lime text-forest flex items-center justify-center shrink-0 border border-forest/20 shadow-xs">
              <Globe className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-forest uppercase tracking-wider">
                Your Link
              </div>
              <div
                className="font-heading font-bold text-sm text-ink truncate max-w-[150px]"
                title={publicUrlDisplay}
              >
                {publicUrlDisplay}
              </div>
            </div>
          </div>

          {/* Actions: Copy Button + Open Link */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-heading font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-95 ${
                copied
                  ? "bg-forest text-lime ring-2 ring-forest"
                  : "bg-forest text-lime hover:bg-[#183d14]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </button>

            <a
              href={getPublicUrl(username)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open public page in new tab"
              className="w-8 h-8 rounded-full bg-cream text-ink/70 hover:text-forest flex items-center justify-center transition-colors border border-hairline active:scale-95 shrink-0"
              title="Open public page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* sm+: Original tall card layout */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-8">
        {/* 1. Total Clicks - Cobalt Card */}
        <div className="bg-cobalt text-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-[1px] hover:shadow-md motion-reduce:transform-none">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              Total clicks
            </span>
            <span
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <MousePointerClick className="w-4 h-4 text-white" />
            </span>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">
              {totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-white/80 font-medium mt-1">
              Across all links
            </p>
          </div>
        </div>

        {/* 2. Links Live - Mint Card */}
        <div className="bg-mint text-forest rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-[1px] hover:shadow-md motion-reduce:transform-none">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/80">
              Links live
            </span>
            <span
              className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Eye className="w-4 h-4 text-forest" />
            </span>
          </div>
          <div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">
              {visibleLinks} of {totalLinks}
            </div>
            <p className="text-xs text-forest/80 font-medium mt-1">
              Visible on your page
            </p>
          </div>
        </div>

        {/* 3. Your Link - Lime Card */}
        <div className="bg-lime text-forest rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-[1px] hover:shadow-md motion-reduce:transform-none">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/80">
              Your link
            </span>
            <span
              className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Globe className="w-4 h-4 text-forest" />
            </span>
          </div>
          <div>
            <p
              className="font-bold text-sm sm:text-base text-forest truncate"
              title={publicUrlDisplay}
            >
              {publicUrlDisplay}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest text-lime font-bold text-xs hover:bg-[#183d14] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied!" : "Copy link"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
