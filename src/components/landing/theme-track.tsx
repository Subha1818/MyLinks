"use client";

import { useRef } from "react";
import Link from "next/link";
import { THEME_PRESETS, ThemePreset } from "@/lib/theme-presets";
import { ProfileView } from "@/components/profile/ProfileView";
import { SAMPLE_PROFILE } from "./sample-profile";
import { Button } from "@/components/ui/button";
import { readableTextOn } from "@/lib/color";
import {
  useScrollProgress,
  useIsDesktop,
  usePrefersReducedMotion,
} from "@/lib/use-scroll-progress";
import { Sparkles, ArrowRight } from "lucide-react";

// 8 real preset phones to show on the track
const TRACK_PRESET_IDS = [
  "lime",
  "cobalt",
  "tomato",
  "lilac",
  "mustard",
  "polka",
  "stripes",
  "sunrise",
] as const;

function getThemeBaseColor(preset: ThemePreset): string {
  const bg = preset.theme.background;
  if (bg.type === "solid") return bg.value;
  if (bg.type === "pattern") return bg.base;
  if (bg.type === "gradient") return bg.from;
  return "#F5F4EF";
}

interface TrackItemData {
  id: string;
  name: string;
  baseColor: string;
  textColor: "#14181F" | "#FFFFFF";
  preset?: ThemePreset;
  isFinalCard?: boolean;
}

export function ThemeTrack() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const isDesktop = useIsDesktop(768);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Selected 8 presets + 1 final card
  const trackPresets = TRACK_PRESET_IDS.map(
    (id) => THEME_PRESETS.find((p) => p.id === id)!
  );

  const items: TrackItemData[] = [
    ...trackPresets.map((preset) => {
      const baseColor = getThemeBaseColor(preset);
      return {
        id: preset.id,
        name: preset.name,
        baseColor,
        textColor: readableTextOn(baseColor),
        preset,
      };
    }),
    {
      id: "more",
      name: "...and 6 more inside",
      baseColor: "#F5F4EF",
      textColor: "#14181F",
      isFinalCard: true,
    },
  ];

  const totalItems = items.length; // 9 items
  const itemWidth = 280; // px
  const itemGap = 40; // px
  const itemDistance = itemWidth + itemGap; // 320px
  const lastIndex = totalItems - 1; // 8

  // Ref to track last focused index to minimize DOM writes
  const lastFocusedIndexRef = useRef<number>(-1);

  // Active frame handler for scroll progress
  const handleProgress = (progress: number) => {
    if (!trackRef.current || !sectionRef.current) return;

    const viewportWidth = window.innerWidth;
    // Exactly center active item in the horizontal middle of the viewport
    const trackTranslate =
      (viewportWidth - itemWidth) / 2 - progress * lastIndex * itemDistance;

    trackRef.current.style.transform = `translate3d(${trackTranslate.toFixed(1)}px, -50%, 0)`;

    const floatingIndex = progress * lastIndex;
    const focusedIndex = Math.min(lastIndex, Math.max(0, Math.round(floatingIndex)));

    // Update item scales and opacities (cheap for 9 items)
    for (let i = 0; i < totalItems; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const dist = Math.abs(floatingIndex - i);
      const factor = Math.max(0, 1 - dist);
      const scale = 0.92 + 0.16 * factor; // 0.92 to 1.08
      const opacity = 0.5 + 0.5 * factor; // 0.5 to 1.0

      el.style.transform = `scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
    }

    // Update progress bar
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    // If focused item changed, crossfade background & text colors
    if (focusedIndex !== lastFocusedIndexRef.current) {
      lastFocusedIndexRef.current = focusedIndex;
      const currentItem = items[focusedIndex];
      if (currentItem) {
        sectionRef.current.style.backgroundColor = currentItem.baseColor;
        sectionRef.current.style.color = currentItem.textColor;

        if (labelRef.current) {
          labelRef.current.textContent = currentItem.name;
        }
      }
    }
  };

  useScrollProgress(sectionRef, handleProgress);

  // Fallback mode: Mobile (<768px), reduced motion, or SSR
  const enableStickyTrack = isDesktop && !prefersReducedMotion;

  return (
    <section
      id="themes"
      ref={sectionRef}
      aria-label="Theme Customization Showcase"
      style={
        enableStickyTrack
          ? {
              height: "260vh",
              backgroundColor: items[0].baseColor,
              color: items[0].textColor,
              transition: "background-color 400ms ease, color 400ms ease",
            }
          : undefined
      }
      className={`relative border-t border-hairline overflow-x-clip ${
        enableStickyTrack ? "" : "bg-cream text-ink py-20 sm:py-28 px-4 sm:px-6"
      }`}
    >
      {/* Visually hidden accessibility list for screen readers */}
      <div className="sr-only">
        <h3>Theme Presets Preview</h3>
        <p>14 ready-made themes including Lime, Cobalt, Tomato, Lilac, Mustard, Polka, Stripes, Sunrise, and 6 more.</p>
        <Link href="/login" className="focus:not-sr-only focus:p-2 focus:bg-white focus:text-ink">
          Explore themes in your dashboard
        </Link>
      </div>

      {enableStickyTrack ? (
        /* DESKTOP / TABLET: Sticky container (100dvh) with horizontally driven track */
        <div className="sticky top-0 h-[100dvh] flex flex-col justify-between py-6 sm:py-8 overflow-hidden select-none">
          {/* Top Pinned Header */}
          <div className="text-center px-4 z-20">
            <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-xs text-current text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>14 ready-made themes</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight transition-colors duration-300">
              Pick your look.
            </h2>
          </div>

          {/* Center: Translating Track */}
          <div className="relative w-full flex-1 overflow-hidden min-h-[520px] my-2">
            <div
              ref={trackRef}
              aria-hidden="true"
              inert={true}
              style={{
                willChange: "transform",
                width: `${totalItems * itemDistance}px`,
                transform: "translate3d(calc(50vw - 140px), -50%, 0)",
              }}
              className="absolute left-0 top-1/2 flex items-center gap-10 flex-nowrap"
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  style={{
                    width: `${itemWidth}px`,
                    transform: index === 0 ? "scale(1.08)" : "scale(0.92)",
                    opacity: index === 0 ? 1 : 0.5,
                  }}
                  className="shrink-0 flex flex-col items-center justify-center transition-transform duration-75"
                >
                  {item.isFinalCard ? (
                    /* Final Solid Card: "...and 6 more inside" */
                    <div className="w-[280px] h-[490px] rounded-[44px] border-4 border-ink bg-white text-ink shadow-2xl p-7 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-mint text-forest border border-ink text-xs font-extrabold px-3 py-1 rounded-full mb-6">
                          <span>✦ 14 Presets Total</span>
                        </div>
                        <h3 className="font-heading font-extrabold text-3xl text-ink leading-tight mb-4">
                          ...and 6 more inside.
                        </h3>
                        <p className="text-ink/75 text-sm font-medium leading-relaxed">
                          From clean minimalist grids to rich forest greens and dark mode. Plus full freedom to customize colors, fonts, button styles, and background patterns.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-hairline">
                        <Link href="/login" className="block w-full">
                          <Button variant="primary" size="48px" className="w-full">
                            <span>Start free</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Phone Preview Shell */
                    <div className="relative w-[280px] h-[490px] rounded-[44px] bg-ink border-[7px] border-ink shadow-2xl overflow-hidden select-none">
                      {/* Notch */}
                      <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-40 pointer-events-none">
                        <div className="w-20 h-4 bg-ink rounded-b-2xl flex items-center justify-center">
                          <div className="w-6 h-1 bg-white/20 rounded-full" />
                        </div>
                      </div>

                      {/* Phone Screen Rendering Real ProfileView */}
                      <div className="w-full h-full bg-white rounded-[36px] overflow-y-auto no-scrollbar relative">
                        <ProfileView
                          mode="preview"
                          displayName={SAMPLE_PROFILE.displayName}
                          bio={SAMPLE_PROFILE.bio}
                          avatarUrl={SAMPLE_PROFILE.avatarUrl}
                          links={SAMPLE_PROFILE.links}
                          theme={item.preset!.theme}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Focused Theme Name Label under Phone */}
            <div className="mt-4 z-20 flex items-center justify-center min-h-[32px]">
              <div
                ref={labelRef}
                className="font-heading font-extrabold text-lg sm:text-2xl tracking-wide uppercase px-4 py-1 rounded-full bg-black/10 backdrop-blur-xs"
              >
                {items[0].name}
              </div>
            </div>
          </div>

          {/* Bottom Pinned Progress Bar */}
          <div className="w-full px-6 max-w-xl mx-auto z-20">
            <div className="w-full h-1.5 bg-black/15 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                style={{ width: "0%" }}
                className="h-full bg-current rounded-full transition-[width] duration-75 ease-out"
              />
            </div>
          </div>
        </div>
      ) : (
        /* MOBILE / REDUCED MOTION: Native Horizontal Scroll-Snap Row */
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-ink/5 text-ink text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>14 ready-made themes</span>
            </div>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink tracking-tight">
              Pick your look.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-ink/70 font-medium">
              Swipe through presets or craft your own look inside your dashboard.
            </p>
          </div>

          {/* Native Scroll-Snap Row */}
          <div
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-2 no-scrollbar"
            tabIndex={0}
            role="region"
            aria-label="Theme Presets Carousel"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="snap-center shrink-0 flex flex-col items-center"
              >
                {item.isFinalCard ? (
                  <div className="w-[260px] sm:w-[280px] h-[480px] rounded-[40px] border-4 border-ink bg-white text-ink shadow-xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-mint text-forest border border-ink text-xs font-extrabold px-3 py-1 rounded-full mb-4">
                        <span>✦ 14 Presets Total</span>
                      </div>
                      <h3 className="font-heading font-extrabold text-2xl text-ink leading-tight mb-3">
                        ...and 6 more inside.
                      </h3>
                      <p className="text-ink/75 text-sm font-medium leading-relaxed">
                        From clean minimalist grids to rich forest greens and dark mode.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-hairline">
                      <Link href="/login" className="block w-full">
                        <Button variant="primary" size="48px" className="w-full">
                          <span>Start free</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-[260px] sm:w-[280px] h-[480px] rounded-[40px] bg-ink border-[7px] border-ink shadow-xl overflow-hidden select-none">
                      <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-40 pointer-events-none">
                        <div className="w-20 h-4 bg-ink rounded-b-2xl flex items-center justify-center">
                          <div className="w-6 h-1 bg-white/20 rounded-full" />
                        </div>
                      </div>
                      <div
                        className="w-full h-full bg-white rounded-[32px] overflow-y-auto no-scrollbar relative"
                        aria-hidden="true"
                        inert={true}
                      >
                        <ProfileView
                          mode="preview"
                          displayName={SAMPLE_PROFILE.displayName}
                          bio={SAMPLE_PROFILE.bio}
                          avatarUrl={SAMPLE_PROFILE.avatarUrl}
                          links={SAMPLE_PROFILE.links}
                          theme={item.preset!.theme}
                        />
                      </div>
                    </div>
                    <div className="font-heading font-extrabold text-sm uppercase tracking-wider text-ink bg-white/60 border border-ink/20 px-3 py-1 rounded-full">
                      {item.name}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/login">
              <Button variant="secondary" size="48px">
                Explore all 14 themes in dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
