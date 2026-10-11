"use client";

import { useState } from "react";
import { MousePointerClick, Eye, Globe, Copy, Check } from "lucide-react";
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
  );
}
