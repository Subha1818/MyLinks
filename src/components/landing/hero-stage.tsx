"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Music,
  Camera,
  Mail,
  MousePointerClick,
} from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";
import { THEME_PRESETS } from "@/lib/theme-presets";
import { SAMPLE_PROFILE } from "./sample-profile";
import { usePrefersReducedMotion } from "@/lib/use-scroll-progress";

// 6 diverse real presets to cycle through in the hero stage (default is sunrise for high contrast against lime hero)
const HERO_PRESETS = [
  THEME_PRESETS.find((p) => p.id === "sunrise") || THEME_PRESETS[13],
  THEME_PRESETS.find((p) => p.id === "lilac") || THEME_PRESETS[3],
  THEME_PRESETS.find((p) => p.id === "cobalt") || THEME_PRESETS[1],
  THEME_PRESETS.find((p) => p.id === "mustard") || THEME_PRESETS[4],
  THEME_PRESETS.find((p) => p.id === "polka") || THEME_PRESETS[8],
  THEME_PRESETS.find((p) => p.id === "lime") || THEME_PRESETS[0],
];

export function HeroStage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepCountRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  const nextPreset = useCallback(() => {
    stepCountRef.current += 1;
    // Theme cycle stops by itself after two full rounds of all themes
    if (stepCountRef.current >= HERO_PRESETS.length * 2) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % HERO_PRESETS.length);
  }, []);

  const togglePlay = () => {
    if (!isPlaying) {
      if (stepCountRef.current >= HERO_PRESETS.length * 2) {
        stepCountRef.current = 0;
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Preset cycling timer (paused on hover, focus, reduced motion, or toggle)
  useEffect(() => {
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
  }, [isPlaying, isHovered, isFocused, prefersReducedMotion, nextPreset]);

  // Desktop Pointer Parallax (only for fine pointers and when motion allowed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer || prefersReducedMotion) return;

    const stage = stageRef.current;
    if (!stage) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number | null = null;

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      stage.style.setProperty("--pointer-x", currentX.toFixed(3));
      stage.style.setProperty("--pointer-y", currentY.toFixed(3));

      if (Math.abs(targetX - currentX) > 0.005 || Math.abs(targetY - currentY) > 0.005) {
        rafId = requestAnimationFrame(updateParallax);
      } else {
        rafId = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      targetX = normX;
      targetY = normY;

      if (rafId === null) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      if (rafId === null) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    stage.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      stage.removeEventListener("mouseleave", onMouseLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const activePreset = HERO_PRESETS[currentIndex];

  return (
    <div
      ref={stageRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="relative w-full max-w-[340px] sm:max-w-[380px] h-[580px] sm:h-[640px] flex items-center justify-center select-none"
    >
      {/* Screen Reader Summary */}
      <span className="sr-only">
        Live mockup of a fictional MyLinks profile for Alex Rivera, cycling through {activePreset.name} theme.
      </span>

      {/* Layer 0: Flat Forest Offset Background Card */}
      <div
        aria-hidden="true"
        style={
          prefersReducedMotion
            ? undefined
            : {
                transform:
                  "translate(calc(12px + var(--pointer-x, 0) * -6px), calc(12px + var(--pointer-y, 0) * -6px)) rotate(calc(-3deg + var(--pointer-x, 0) * -1deg))",
              }
        }
        className="absolute inset-0 max-w-[270px] sm:max-w-[300px] h-[520px] sm:h-[580px] mx-auto bg-forest rounded-[48px] -rotate-3 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 border-4 border-forest/20 shadow-xl transition-transform duration-75 pointer-events-none"
      />

      {/* Layer 1: The Phone (with Scroll & Pointer Parallax) */}
      <div
        aria-hidden="true"
        inert={true}
        style={
          prefersReducedMotion
            ? undefined
            : {
                transform:
                  "translate(calc(var(--pointer-x, 0) * 8px), calc(calc(var(--progress, 0) * 36px) + var(--pointer-y, 0) * 8px)) rotate(calc(1.5deg + calc(var(--progress, 0) * 3deg) + var(--pointer-x, 0) * 1.5deg))",
              }
        }
        className={`relative w-[270px] sm:w-[300px] h-[520px] sm:h-[580px] rounded-[44px] bg-ink border-[8px] border-ink shadow-2xl overflow-hidden z-10 transition-transform duration-75 ${
          prefersReducedMotion ? "rotate-1" : "animate-hero-slide-up"
        }`}
      >
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-40 pointer-events-none">
          <div className="w-20 h-4 bg-ink rounded-b-2xl flex items-center justify-center">
            <div className="w-6 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Real ProfileView Render */}
        <div
          style={{ scrollbarWidth: "none" }}
          className="w-full h-full bg-white rounded-[34px] overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden relative"
        >
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

      {/* Layer 2: Floating Satellites (aria-hidden) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
      >
        {/* Satellite A: Column of circular icon chips on the right edge */}
        <div
          style={
            prefersReducedMotion
              ? undefined
              : {
                  transform:
                    "translate(calc(var(--pointer-x, 0) * -10px), calc(var(--pointer-y, 0) * -10px))",
                }
          }
          className={`absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3 transition-transform duration-75 ${
            prefersReducedMotion ? "" : "animate-float-b"
          }`}
        >
          {/* Chip 1: Lilac */}
          <div
            style={prefersReducedMotion ? undefined : { animationDelay: "450ms" }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-lilac text-forest border-2 border-forest flex items-center justify-center shadow-[3px_3px_0px_#1F4D1A] ${
              prefersReducedMotion ? "" : "animate-satellite-pop"
            }`}
          >
            <Music className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
          </div>

          {/* Chip 2: Mustard */}
          <div
            style={prefersReducedMotion ? undefined : { animationDelay: "550ms" }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-mustard text-forest border-2 border-forest flex items-center justify-center shadow-[3px_3px_0px_#1F4D1A] ${
              prefersReducedMotion ? "" : "animate-satellite-pop"
            }`}
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
          </div>

          {/* Chip 3: White (desktop only - 2 satellites on mobile) */}
          <div
            style={prefersReducedMotion ? undefined : { animationDelay: "650ms" }}
            className={`hidden sm:flex w-11 h-11 rounded-full bg-white text-forest border-2 border-forest items-center justify-center shadow-[3px_3px_0px_#1F4D1A] ${
              prefersReducedMotion ? "" : "animate-satellite-pop"
            }`}
          >
            <Mail className="w-5 h-5 stroke-[2.4]" />
          </div>
        </div>

        {/* Satellite B: Small notification card near top-left of phone */}
        <div
          style={
            prefersReducedMotion
              ? undefined
              : {
                  transform:
                    "translate(calc(var(--pointer-x, 0) * 12px), calc(var(--pointer-y, 0) * 12px))",
                }
          }
          className={`absolute -left-3 sm:-left-7 top-10 sm:top-14 transition-transform duration-75 ${
            prefersReducedMotion ? "" : "animate-float-a"
          }`}
        >
          <div
            className={`bg-white text-forest border-2 border-forest rounded-2xl p-2.5 sm:p-3 shadow-[4px_4px_0px_#1F4D1A] max-w-[170px] sm:max-w-[195px] ${
              prefersReducedMotion ? "opacity-100" : "animate-notification-loop"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-lime text-forest px-2 py-0.5 rounded-full border border-forest">
                <MousePointerClick className="w-3 h-3 stroke-[2.5]" /> +1 click
              </span>
            </div>
            <p className="text-[11px] font-bold text-forest mt-1.5 leading-tight truncate">
              Someone opened Portfolio
            </p>
          </div>
        </div>

        {/* Satellite C: Small 'Live' badge near phone top-right */}
        <div
          style={
            prefersReducedMotion
              ? undefined
              : {
                  transform:
                    "translate(calc(var(--pointer-x, 0) * 10px), calc(var(--pointer-y, 0) * 10px))",
                }
          }
          className={`absolute -right-1 sm:right-2 -top-2 sm:-top-3 transition-transform duration-75 ${
            prefersReducedMotion ? "" : "animate-float-c"
          }`}
        >
          <div
            style={prefersReducedMotion ? undefined : { animationDelay: "350ms" }}
            className={`bg-forest text-lime border-2 border-lime px-3 py-1 rounded-full text-xs font-extrabold shadow-[2px_2px_0px_#1F4D1A] flex items-center gap-1.5 ${
              prefersReducedMotion ? "" : "animate-satellite-pop"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full bg-lime ${
                prefersReducedMotion ? "" : "animate-pulse"
              }`}
            />
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* ONE small icon-only pause/play button in a quiet corner of the stage */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause theme animation" : "Play theme animation"}
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-30 w-9 h-9 rounded-full bg-white text-forest border border-forest/20 shadow-md flex items-center justify-center hover:bg-cream active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 stroke-[2.5]" />
        ) : (
          <Play className="w-4 h-4 stroke-[2.5] ml-0.5" />
        )}
      </button>
    </div>
  );
}
