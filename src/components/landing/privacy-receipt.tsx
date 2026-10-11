"use client";

import { useState } from "react";
import { Check, X, MousePointerClick, RefreshCw, ExternalLink } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-scroll-progress";

export function PrivacyReceipt() {
  const [isPrinted, setIsPrinted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPrinted(true);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPrinted(false);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Trigger Area */}
      <div className="flex flex-col items-center gap-3">
        <button
          id="portfolio-receipt-trigger"
          type="button"
          onClick={handleTrigger}
          aria-expanded={isPrinted}
          aria-controls="privacy-receipt-output"
          className="group relative bg-lime text-forest font-heading font-extrabold text-base sm:text-lg px-8 py-3.5 rounded-full border-2 border-forest shadow-[4px_4px_0px_#14181F] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#14181F] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          <ExternalLink className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
          <span>Portfolio</span>
        </button>

        <span className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-lime" />
          <span>Try it: click this link</span>
        </span>
      </div>

      {/* Interactive Paper Receipt Strip */}
      {isPrinted && (
        <div
          id="privacy-receipt-output"
          aria-live="polite"
          className="mt-6 w-full max-w-sm sm:max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Plain-text summary for assistive technology */}
          <div className="sr-only">
            Stored: time, link, country, device type. Not stored: IP address, cookies, browser details, identity.
          </div>

          <div className="relative bg-white text-ink border-2 border-ink rounded-t-2xl shadow-2xl p-5 sm:p-7 -rotate-1 font-mono text-xs sm:text-sm">
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-ink/20">
              <div className="font-extrabold text-sm sm:text-base tracking-wider uppercase">
                MyLinks Telemetry Log
              </div>
              <div className="text-[11px] text-ink/60 mt-0.5">
                Session #8402 • Public Click Event
              </div>
            </div>

            {/* STORED Section */}
            <div className="py-4 border-b-2 border-dashed border-ink/20 flex flex-col gap-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-forest flex items-center gap-1">
                <span>✦ Stored Records (Aggregated)</span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "150ms" }}
                className={`flex items-center justify-between bg-cream/70 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/60">TIMESTAMP</span>
                <span className="font-bold flex items-center gap-1.5 text-forest">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-forest" /> 12:04:31 UTC
                </span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "280ms" }}
                className={`flex items-center justify-between bg-cream/70 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/60">TARGET LINK</span>
                <span className="font-bold flex items-center gap-1.5 text-forest">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-forest" /> Portfolio
                </span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "410ms" }}
                className={`flex items-center justify-between bg-cream/70 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/60">COUNTRY</span>
                <span className="font-bold flex items-center gap-1.5 text-forest">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-forest" /> IN (coarse header)
                </span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "540ms" }}
                className={`flex items-center justify-between bg-cream/70 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/60">DEVICE TYPE</span>
                <span className="font-bold flex items-center gap-1.5 text-forest">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-forest" /> mobile
                </span>
              </div>
            </div>

            {/* NOT STORED Section */}
            <div className="py-4 border-b-2 border-dashed border-ink/20 flex flex-col gap-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-tomato flex items-center gap-1">
                <span>✕ Never Logged or Stored</span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "670ms" }}
                className={`flex items-center justify-between bg-cream/40 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/50 line-through">IP ADDRESS</span>
                <span className="text-[10px] font-extrabold uppercase bg-tomato/15 text-tomato border border-tomato/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <X className="w-3 h-3 stroke-[3]" /> Never Logged
                </span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "800ms" }}
                className={`flex items-center justify-between bg-cream/40 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/50 line-through">COOKIES / PIXELS</span>
                <span className="text-[10px] font-extrabold uppercase bg-tomato/15 text-tomato border border-tomato/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <X className="w-3 h-3 stroke-[3]" /> Never Stored
                </span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "930ms" }}
                className={`flex items-center justify-between bg-cream/40 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/50 line-through">USER AGENT / FP</span>
                <span className="text-[10px] font-extrabold uppercase bg-tomato/15 text-tomato border border-tomato/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <X className="w-3 h-3 stroke-[3]" /> Never Stored
                </span>
              </div>

              <div
                style={prefersReducedMotion ? undefined : { animationDelay: "1060ms" }}
                className={`flex items-center justify-between bg-cream/40 px-2.5 py-1.5 rounded border border-ink/10 ${
                  prefersReducedMotion ? "" : "animate-slide-in-up"
                }`}
              >
                <span className="text-ink/50 line-through">NAME / EMAIL</span>
                <span className="text-[10px] font-extrabold uppercase bg-tomato/15 text-tomato border border-tomato/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <X className="w-3 h-3 stroke-[3]" /> Anonymous
                </span>
              </div>
            </div>

            {/* Footer Summary & Replay */}
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink/75 italic">
                “That&apos;s the whole record.”
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-cream hover:bg-hairline px-3 py-1.5 rounded-full border border-ink/20 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Again</span>
              </button>
            </div>

            {/* CSS / SVG Zigzag Perforated Bottom Edge */}
            <div className="absolute -bottom-3 inset-x-0 w-full overflow-hidden leading-none pointer-events-none">
              <svg
                className="w-full h-3 text-white fill-current block"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0 0 L10 12 L20 0 L30 12 L40 0 L50 12 L60 0 L70 12 L80 0 L90 12 L100 0 L110 12 L120 0 L130 12 L140 0 L150 12 L160 0 L170 12 L180 0 L190 12 L200 0 Z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
