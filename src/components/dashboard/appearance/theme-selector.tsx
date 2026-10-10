"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/dashboard/card";
import { usePageDraft } from "@/components/dashboard/PageDraftProvider";
import { THEME_PRESETS, ThemePreset } from "@/lib/theme-presets";
import { resolveTheme, ThemeConfig } from "@/lib/theme";
import { updateTheme as updateThemeAction } from "@/server/actions/theme";
import { Check, Loader2 } from "lucide-react";

function isThemeEqual(a: ThemeConfig, b: ThemeConfig): boolean {
  return (
    a.background.type === b.background.type &&
    a.background.value.toLowerCase() === b.background.value.toLowerCase() &&
    a.textColor.toLowerCase() === b.textColor.toLowerCase() &&
    a.button.shape === b.button.shape &&
    a.button.style === b.button.style &&
    a.button.fill.toLowerCase() === b.button.fill.toLowerCase() &&
    a.button.textColor.toLowerCase() === b.button.textColor.toLowerCase() &&
    a.font === b.font
  );
}

export function ThemeSelector({ initialTheme }: { initialTheme: unknown }) {
  const router = useRouter();
  const { draft, updateTheme } = usePageDraft();

  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(() =>
    resolveTheme(initialTheme)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const resolvedDraftTheme = resolveTheme(draft.theme);
  const matchingPreset = THEME_PRESETS.find((p) =>
    isThemeEqual(p.theme, resolvedDraftTheme)
  );
  const selectedPresetId = matchingPreset?.id ?? null;
  const isCustomTheme = selectedPresetId === null;

  const hasChanges = !isThemeEqual(resolvedDraftTheme, savedTheme);

  // Warn before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleSelectPreset = (preset: ThemePreset) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme(preset.theme);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

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

    if (nextIndex !== null) {
      const nextPreset = THEME_PRESETS[nextIndex];
      handleSelectPreset(nextPreset);
      cardsRef.current[nextIndex]?.focus();
    }
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    setIsSuccess(false);
    setGeneralError(null);

    try {
      const res = await updateThemeAction(resolvedDraftTheme);
      if (res.ok) {
        setSavedTheme(res.theme);
        setIsSuccess(true);
        router.refresh();
      } else {
        setGeneralError(res.message || "Failed to save theme.");
      }
    } catch {
      setGeneralError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme(savedTheme);
  };

  return (
    <Card className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-ink/5 gap-3">
        <div>
          <h2 className="font-heading font-black text-xl text-ink">Themes</h2>
          <p className="text-sm text-ink/60 font-medium mt-1">
            Pick a curated theme preset for your public profile.
          </p>
        </div>

        {isCustomTheme && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/10 border border-forest/20 text-xs font-bold text-forest self-start sm:self-auto">
            <span>Custom theme</span>
          </div>
        )}
      </div>

      {/* Preset Cards Grid with RadioGroup accessibility */}
      <div
        role="radiogroup"
        aria-label="Theme presets"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-6"
      >
        {THEME_PRESETS.map((preset, index) => {
          const isSelected = selectedPresetId === preset.id;
          const tabIndex =
            isSelected || (selectedPresetId === null && index === 0) ? 0 : -1;

          return (
            <button
              key={preset.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${preset.name} theme preset`}
              tabIndex={tabIndex}
              onClick={() => handleSelectPreset(preset)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`group flex flex-col items-center gap-2.5 p-2.5 rounded-2xl transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
                isSelected
                  ? "ring-2 ring-forest ring-offset-2 bg-forest/5"
                  : "hover:bg-ink/5"
              }`}
            >
              {/* Mini phone-shaped swatch */}
              <div
                className="w-full aspect-[9/14] rounded-xl p-2.5 flex flex-col items-center justify-between shadow-xs relative overflow-hidden border border-ink/10 transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: preset.theme.background.value }}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-forest text-cream flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Tiny avatar circle */}
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 mt-2 shadow-xs"
                  style={{
                    backgroundColor: preset.theme.button.fill,
                    border:
                      preset.theme.button.style === "solid"
                        ? "1px solid rgba(0,0,0,0.08)"
                        : undefined,
                  }}
                />

                {/* Three small buttons drawn with the preset's real shape/style/colors */}
                <div className="w-full flex flex-col gap-1.5 mb-2 px-1">
                  {[0, 1, 2].map((i) => {
                    const shapeClass =
                      preset.theme.button.shape === "pill"
                        ? "rounded-full"
                        : preset.theme.button.shape === "rounded"
                        ? "rounded-md"
                        : "rounded-none";

                    const buttonSwatchStyle: React.CSSProperties =
                      preset.theme.button.style === "outline"
                        ? {
                            backgroundColor: "transparent",
                            border: `1.5px solid ${preset.theme.button.fill}`,
                          }
                        : preset.theme.button.style === "hard-shadow"
                        ? {
                            backgroundColor: preset.theme.button.fill,
                            border: `1.5px solid ${preset.theme.button.textColor}`,
                            boxShadow: `2px 2px 0px ${preset.theme.button.textColor}`,
                          }
                        : {
                            backgroundColor: preset.theme.button.fill,
                          };

                    return (
                      <div
                        key={i}
                        className={`w-full h-3.5 flex items-center justify-center ${shapeClass}`}
                        style={buttonSwatchStyle}
                      >
                        {/* Tiny representative button text bar */}
                        <div
                          className="w-1/2 h-1 rounded-full opacity-60"
                          style={{
                            backgroundColor:
                              preset.theme.button.style === "outline"
                                ? preset.theme.button.textColor
                                : preset.theme.button.textColor,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preset Name */}
              <div className="flex items-center justify-center">
                <span
                  className={`text-sm font-bold ${
                    isSelected ? "text-forest font-black" : "text-ink"
                  }`}
                >
                  {preset.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {generalError && (
        <div className="pt-6">
          <p className="text-sm text-coral font-medium" aria-live="polite">
            {generalError}
          </p>
        </div>
      )}

      {/* Actions: Save Theme & Reset */}
      <div className="flex items-center gap-4 pt-6 border-t border-ink/5 mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="inline-flex items-center justify-center min-w-[140px] gap-2 bg-ink text-cream font-bold py-3 px-6 rounded-full transition-all hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Save theme"
          )}
        </button>

        {hasChanges && !isSaving && (
          <button
            type="button"
            onClick={handleReset}
            className="text-ink/60 hover:text-ink font-bold text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-full"
          >
            Reset
          </button>
        )}

        {isSuccess && (
          <div
            className="inline-flex items-center gap-2 text-forest font-bold text-sm ml-auto animate-in fade-in slide-in-from-left-2"
            aria-live="polite"
          >
            <Check className="w-4 h-4" />
            <span>Theme saved</span>
          </div>
        )}
      </div>
    </Card>
  );
}
