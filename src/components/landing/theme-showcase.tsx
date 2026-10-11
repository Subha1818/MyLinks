"use client";

import { useState, useRef } from "react";
import { THEME_PRESETS, ThemePreset } from "@/lib/theme-presets";
import { ProfileView } from "@/components/profile/ProfileView";
import { SAMPLE_PROFILE } from "./sample-profile";
import { Sparkles } from "lucide-react";

export function ThemeShowcase() {
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>(THEME_PRESETS[0]);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % THEME_PRESETS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + THEME_PRESETS.length) % THEME_PRESETS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = THEME_PRESETS.length - 1;
    }

    if (nextIndex !== index) {
      setSelectedPreset(THEME_PRESETS[nextIndex]);
      chipRefs.current[nextIndex]?.focus();
    }
  };

  const getSwatchColor = (preset: ThemePreset) => {
    const bg = preset.theme.background;
    if (bg.type === "solid") return bg.value;
    if (bg.type === "gradient") return bg.from;
    return bg.base;
  };

  return (
    <section
      id="themes"
      aria-label="Theme Customization Showcase"
      className="bg-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-hairline"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-ink/5 text-ink text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pick your look</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-ink tracking-tight">
            14 ready-made themes.
          </h2>
          <p className="mt-4 text-base sm:text-xl text-ink/70 font-medium max-w-2xl mx-auto">
            Switch palettes in one click, or fine-tune fonts, button shapes,
            patterns, and layouts inside your dashboard.
          </p>
        </div>

        {/* Preset Chips Row (Horizontal Scroll on Mobile, Wrapped on Desktop) */}
        <div
          role="radiogroup"
          aria-label="Preset styles"
          className="flex overflow-x-auto gap-2.5 pb-4 px-2 no-scrollbar sm:flex-wrap sm:justify-center items-center"
        >
          {THEME_PRESETS.map((preset, index) => {
            const isSelected = selectedPreset.id === preset.id;
            const swatchBg = getSwatchColor(preset);
            const buttonFill = preset.theme.button.fill;

            return (
              <button
                key={preset.id}
                ref={(el) => {
                  chipRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelectedPreset(preset)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-forest text-lime shadow-md scale-105"
                    : "bg-white text-ink border border-hairline hover:bg-cream hover:border-ink/20"
                }`}
              >
                {/* Two tiny color dots for preview */}
                <span className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: swatchBg }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: buttonFill }}
                  />
                </span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Large Phone Mockup with Real ProfileView */}
        <div className="mt-10 sm:mt-14 flex flex-col items-center">
          <div className="relative w-[300px] sm:w-[330px] md:w-[350px] h-[620px] sm:h-[660px] rounded-[48px] bg-ink border-[8px] border-ink shadow-2xl flex-shrink-0 overflow-hidden select-none">
            {/* Dynamic Island Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-40 pointer-events-none">
              <div className="w-28 h-5 bg-ink rounded-b-2xl flex items-center justify-center">
                <div className="w-8 h-1 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Real ProfileView Render */}
            <div
              className="w-full h-full bg-white rounded-[38px] overflow-y-auto no-scrollbar relative"
              aria-hidden="true"
              // @ts-expect-error React 19 inert attribute
              inert=""
            >
              <ProfileView
                mode="preview"
                displayName={SAMPLE_PROFILE.displayName}
                bio={SAMPLE_PROFILE.bio}
                avatarUrl={SAMPLE_PROFILE.avatarUrl}
                links={SAMPLE_PROFILE.links}
                theme={selectedPreset.theme}
              />
            </div>
          </div>

          <p className="mt-4 text-xs font-bold text-ink/50 uppercase tracking-widest">
            Currently previewing: {selectedPreset.name} theme
          </p>
        </div>
      </div>
    </section>
  );
}
