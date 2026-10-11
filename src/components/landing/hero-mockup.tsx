"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";
import { THEME_PRESETS } from "@/lib/theme-presets";
import { SAMPLE_PROFILE } from "./sample-profile";

// 6 diverse real presets to cycle through in the hero mockup
const HERO_PRESETS = [
  THEME_PRESETS.find((p) => p.id === "lime") || THEME_PRESETS[0],
  THEME_PRESETS.find((p) => p.id === "lilac") || THEME_PRESETS[3],
  THEME_PRESETS.find((p) => p.id === "cobalt") || THEME_PRESETS[1],
  THEME_PRESETS.find((p) => p.id === "mustard") || THEME_PRESETS[4],
  THEME_PRESETS.find((p) => p.id === "polka") || THEME_PRESETS[8],
  THEME_PRESETS.find((p) => p.id === "sunset") || THEME_PRESETS[12],
];

export function HeroMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextPreset = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_PRESETS.length);
  }, []);

  // Interval timer for 3-second cycle (stops on hover, focus, or reduced motion)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isPlaying || isHovered || isFocused || prefersReducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextPreset();
    }, 3200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, isFocused, nextPreset]);

  const activePreset = HERO_PRESETS[currentIndex];

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/* Accessible screen-reader description */}
      <span className="sr-only">
        Live mockup of a fictional MyLinks profile for Alex Rivera, cycling
        through {activePreset.name} theme.
      </span>

      {/* Offset flat background card for landing visual pop */}
      <div
        className="absolute inset-0 max-w-[320px] h-[610px] mx-auto bg-forest rounded-[52px] -rotate-3 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 border-4 border-forest/20 shadow-xl"
        aria-hidden="true"
      />

      {/* Decorative Phone Shell */}
      <div
        aria-hidden="true"
        // @ts-expect-error React 19 inert attribute
        inert=""
        className="relative w-[300px] sm:w-[320px] h-[600px] rounded-[48px] bg-ink border-[8px] border-ink shadow-2xl flex-shrink-0 overflow-hidden select-none rotate-1 hover:rotate-0 transition-transform duration-300"
      >
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-40 pointer-events-none">
          <div className="w-24 h-5 bg-ink rounded-b-2xl flex items-center justify-center">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Real ProfileView Render */}
        <div className="w-full h-full bg-white rounded-[38px] overflow-y-auto no-scrollbar relative transition-opacity duration-300">
          <ProfileView
            mode="preview"
            displayName={SAMPLE_PROFILE.displayName}
            bio={SAMPLE_PROFILE.bio}
            avatarUrl={SAMPLE_PROFILE.avatarUrl}
            links={SAMPLE_PROFILE.links}
            theme={activePreset.theme}
          />
        </div>
      </div>

      {/* Mockup Controls & Theme Label */}
      <div className="relative z-10 mt-6 flex items-center gap-3 bg-forest text-lime px-4 py-2 rounded-full border border-forest/30 shadow-md">
        <span className="text-xs font-bold uppercase tracking-wider">
          Theme: {activePreset.name}
        </span>

        <span className="text-lime/40" aria-hidden="true">
          •
        </span>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause theme preview cycling" : "Play theme preview cycling"}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-lime/15 hover:bg-lime/25 text-lime px-2.5 py-1 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 stroke-[2.5]" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 stroke-[2.5]" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
