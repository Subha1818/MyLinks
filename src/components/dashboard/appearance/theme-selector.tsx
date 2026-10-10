"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/dashboard/card";
import { usePageDraft } from "@/components/dashboard/PageDraftProvider";
import { THEME_PRESETS, ThemePreset } from "@/lib/theme-presets";
import {
  resolveTheme,
  ThemeConfig,
  FONT_OPTIONS,
  FontOption,
  ButtonShape,
  ButtonStyle,
} from "@/lib/theme";
import {
  normalizeHex,
  readableTextOn,
  getThemeReadabilityIssues,
  ReadabilityIssue,
} from "@/lib/color";
import { getFontFamily } from "@/components/profile/ProfileView";
import { updateTheme as updateThemeAction } from "@/server/actions/theme";
import { Check, Loader2, AlertTriangle, AlertCircle, Wand2 } from "lucide-react";

const BRAND_PALETTE = [
  "#D4E83A", // Lime
  "#2563D9", // Cobalt
  "#7A0A1E", // Maroon
  "#EBC4EE", // Lilac
  "#E0A92E", // Mustard
  "#F5F4EF", // Cream
  "#1F4D1A", // Forest
  "#FF5A36", // Tomato
  "#BFEBD6", // Mint
  "#14181F", // Ink
  "#FFFFFF", // White
];

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

// ---------------------------------------------------------------------------
// Color Control Component
// ---------------------------------------------------------------------------
interface ColorControlProps {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
  issue?: ReadabilityIssue;
  onFix?: () => void;
}

function ColorControl({
  id,
  label,
  value,
  onChange,
  issue,
  onFix,
}: ColorControlProps) {
  // Only track typed text while actively editing an uncommitted input
  const [typedText, setTypedText] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const displayHex = typedText ?? value;
  const isValidHex = normalizeHex(displayHex) !== null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedText(raw);
    const normalized = normalizeHex(raw);
    if (normalized) {
      onChange(normalized);
    }
  };

  const handleInputBlur = () => {
    if (typedText !== null) {
      const normalized = normalizeHex(typedText);
      if (normalized) {
        onChange(normalized);
      }
      setTypedText(null);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.toUpperCase();
    setTypedText(null);
    onChange(newHex);
  };

  const handlePalettePick = (hex: string) => {
    setTypedText(null);
    onChange(hex);
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-ink/[0.02] border border-ink/5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
        </label>
        {!isValidHex && (
          <span className="text-xs font-semibold text-coral animate-pulse">
            Invalid hex
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Hidden native color picker */}
        <input
          ref={colorInputRef}
          type="color"
          id={id}
          value={normalizeHex(value) || "#FFFFFF"}
          onChange={handleNativeColorChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Visual Swatch button */}
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          aria-label={`Open color picker for ${label}`}
          className="w-10 h-10 rounded-xl border border-ink/15 shadow-xs flex-shrink-0 cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          style={{ backgroundColor: normalizeHex(value) || value }}
        />

        {/* Hex Text input */}
        <input
          type="text"
          value={displayHex}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="#000000"
          maxLength={7}
          className={`flex-1 font-mono text-sm px-3.5 py-2 rounded-xl bg-white border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
            isValidHex ? "border-ink/10 text-ink" : "border-coral text-coral"
          }`}
        />
      </div>

      {/* Quick-pick brand color palette */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {BRAND_PALETTE.map((hex) => {
          const isSelected = hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              onClick={() => handlePalettePick(hex)}
              aria-label={`Select color ${hex}`}
              className={`w-6 h-6 rounded-md border transition-transform hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                isSelected
                  ? "ring-2 ring-forest ring-offset-1 scale-110 border-forest"
                  : "border-ink/15 hover:border-ink/40"
              }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
      </div>

      {/* Inline contrast message if issue exists */}
      {issue && (
        <div
          className={`flex items-start sm:items-center justify-between gap-2 p-2.5 mt-1 rounded-xl text-xs font-medium ${
            issue.level === "error"
              ? "bg-coral/10 border border-coral/20 text-coral"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-900"
          }`}
          aria-live="polite"
        >
          <div className="flex items-center gap-1.5">
            {issue.level === "error" ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-coral" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            )}
            <span>{issue.message}</span>
          </div>

          {onFix && (
            <button
              type="button"
              onClick={onFix}
              className="inline-flex items-center gap-1 font-bold underline cursor-pointer hover:opacity-80 flex-shrink-0 ml-1"
            >
              <Wand2 className="w-3 h-3" />
              <span>Fix</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ThemeSelector Component
// ---------------------------------------------------------------------------
export function ThemeSelector({ initialTheme }: { initialTheme: unknown }) {
  const router = useRouter();
  const { draft, updateTheme } = usePageDraft();

  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(() =>
    resolveTheme(initialTheme)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const presetCardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const fontCardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const resolvedDraftTheme = resolveTheme(draft.theme);

  // Check matching preset
  const matchingPreset = THEME_PRESETS.find((p) =>
    isThemeEqual(p.theme, resolvedDraftTheme)
  );
  const selectedPresetId = matchingPreset?.id ?? null;
  const isCustomTheme = selectedPresetId === null;

  // Contrast readability checks
  const readabilityIssues = getThemeReadabilityIssues(resolvedDraftTheme);
  const pageIssue = readabilityIssues.find((i) => i.pair === "page");
  const buttonIssue = readabilityIssues.find((i) => i.pair === "button");
  const hasErrorIssues = readabilityIssues.some((i) => i.level === "error");

  const hasChanges = !isThemeEqual(resolvedDraftTheme, savedTheme);

  // Warn before leaving page with unsaved changes
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

  // Handlers for theme adjustments
  const handleSelectPreset = (preset: ThemePreset) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme(preset.theme);
  };

  const handleUpdateColor = (
    key: "background" | "textColor" | "buttonFill" | "buttonTextColor",
    value: string
  ) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (key === "background") {
      updateTheme({
        ...resolvedDraftTheme,
        background: { type: "solid", value },
      });
    } else if (key === "textColor") {
      updateTheme({
        ...resolvedDraftTheme,
        textColor: value,
      });
    } else if (key === "buttonFill") {
      updateTheme({
        ...resolvedDraftTheme,
        button: {
          ...resolvedDraftTheme.button,
          fill: value,
        },
      });
    } else if (key === "buttonTextColor") {
      updateTheme({
        ...resolvedDraftTheme,
        button: {
          ...resolvedDraftTheme.button,
          textColor: value,
        },
      });
    }
  };

  const handleUpdateShape = (shape: ButtonShape) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      button: {
        ...resolvedDraftTheme.button,
        shape,
      },
    });
  };

  const handleUpdateStyle = (style: ButtonStyle) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      button: {
        ...resolvedDraftTheme.button,
        style,
      },
    });
  };

  const handleUpdateFont = (font: FontOption) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      font,
    });
  };

  // Auto-fix contrast handlers
  const handleFixPageContrast = () => {
    const optimalColor = readableTextOn(resolvedDraftTheme.background.value);
    handleUpdateColor("textColor", optimalColor);
  };

  const handleFixButtonContrast = () => {
    const isOutline = resolvedDraftTheme.button.style === "outline";
    const bg = isOutline
      ? resolvedDraftTheme.background.value
      : resolvedDraftTheme.button.fill;
    const optimalColor = readableTextOn(bg);
    handleUpdateColor("buttonTextColor", optimalColor);
  };

  // Keyboard navigation for Presets
  const handlePresetKeyDown = (e: React.KeyboardEvent, index: number) => {
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
      handleSelectPreset(THEME_PRESETS[nextIndex]);
      presetCardsRef.current[nextIndex]?.focus();
    }
  };

  // Keyboard navigation for Fonts
  const handleFontKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % FONT_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + FONT_OPTIONS.length) % FONT_OPTIONS.length;
    }

    if (nextIndex !== null) {
      handleUpdateFont(FONT_OPTIONS[nextIndex].id);
      fontCardsRef.current[nextIndex]?.focus();
    }
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving || hasErrorIssues) return;
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
    <div className="space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Presets Card                                                   */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-ink/5 gap-3">
          <div>
            <h2 className="font-heading font-black text-xl text-ink">Presets</h2>
            <p className="text-sm text-ink/60 font-medium mt-1">
              Choose from curated, high-contrast brand themes.
            </p>
          </div>

          {isCustomTheme && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/10 border border-forest/20 text-xs font-bold text-forest self-start sm:self-auto">
              <span>Custom theme active</span>
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
                  presetCardsRef.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${preset.name} theme preset`}
                tabIndex={tabIndex}
                onClick={() => handleSelectPreset(preset)}
                onKeyDown={(e) => handlePresetKeyDown(e, index)}
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
                          <div
                            className="w-1/2 h-1 rounded-full opacity-60"
                            style={{
                              backgroundColor: preset.theme.button.textColor,
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
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Customize Card                                                 */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <div className="pb-6 border-b border-ink/5">
          <h2 className="font-heading font-black text-xl text-ink">Customize</h2>
          <p className="text-sm text-ink/60 font-medium mt-1">
            Fine-tune colors, button styles, and typography.
          </p>
        </div>

        <div className="space-y-8 pt-6">
          {/* Colors Section */}
          <section aria-labelledby="colors-heading" className="space-y-4">
            <h3
              id="colors-heading"
              className="text-base font-heading font-bold text-ink"
            >
              Colors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorControl
                id="bg-color"
                label="Page background"
                value={resolvedDraftTheme.background.value}
                onChange={(hex) => handleUpdateColor("background", hex)}
                issue={pageIssue}
                onFix={pageIssue ? handleFixPageContrast : undefined}
              />
              <ColorControl
                id="text-color"
                label="Text color"
                value={resolvedDraftTheme.textColor}
                onChange={(hex) => handleUpdateColor("textColor", hex)}
                issue={pageIssue}
                onFix={pageIssue ? handleFixPageContrast : undefined}
              />
              <ColorControl
                id="btn-fill"
                label="Button color"
                value={resolvedDraftTheme.button.fill}
                onChange={(hex) => handleUpdateColor("buttonFill", hex)}
                issue={buttonIssue}
                onFix={buttonIssue ? handleFixButtonContrast : undefined}
              />
              <ColorControl
                id="btn-text"
                label="Button text"
                value={resolvedDraftTheme.button.textColor}
                onChange={(hex) => handleUpdateColor("buttonTextColor", hex)}
                issue={buttonIssue}
                onFix={buttonIssue ? handleFixButtonContrast : undefined}
              />
            </div>
          </section>

          {/* Buttons Section */}
          <section aria-labelledby="buttons-heading" className="space-y-6 pt-4 border-t border-ink/5">
            <h3
              id="buttons-heading"
              className="text-base font-heading font-bold text-ink"
            >
              Buttons
            </h3>

            {/* Shape Segmented Control */}
            <div className="space-y-2">
              <span id="shape-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Shape
              </span>
              <div
                role="radiogroup"
                aria-labelledby="shape-label"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
              >
                {(
                  [
                    { id: "pill", label: "Pill" },
                    { id: "rounded", label: "Rounded" },
                    { id: "square", label: "Square" },
                  ] as const
                ).map((opt) => {
                  const isSelected = resolvedDraftTheme.button.shape === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleUpdateShape(opt.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                        isSelected
                          ? "bg-white text-ink shadow-xs"
                          : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Segmented Control */}
            <div className="space-y-2">
              <span id="style-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Style
              </span>
              <div
                role="radiogroup"
                aria-labelledby="style-label"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
              >
                {(
                  [
                    { id: "solid", label: "Solid" },
                    { id: "outline", label: "Outline" },
                    { id: "hard-shadow", label: "Hard shadow" },
                  ] as const
                ).map((opt) => {
                  const isSelected = resolvedDraftTheme.button.style === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleUpdateStyle(opt.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                        isSelected
                          ? "bg-white text-ink shadow-xs"
                          : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section aria-labelledby="font-heading" className="space-y-4 pt-4 border-t border-ink/5">
            <h3
              id="font-heading"
              className="text-base font-heading font-bold text-ink"
            >
              Typography
            </h3>

            <div
              role="radiogroup"
              aria-label="Font family options"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {FONT_OPTIONS.map((opt, index) => {
                const isSelected = resolvedDraftTheme.font === opt.id;
                const tabIndex = isSelected ? 0 : index === 0 ? 0 : -1;

                return (
                  <button
                    key={opt.id}
                    ref={(el) => {
                      fontCardsRef.current[index] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIndex}
                    onClick={() => handleUpdateFont(opt.id)}
                    onKeyDown={(e) => handleFontKeyDown(e, index)}
                    className={`flex flex-col items-start p-4 rounded-2xl border transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
                      isSelected
                        ? "border-forest bg-forest/5 ring-1 ring-forest"
                        : "border-ink/10 hover:border-ink/25 bg-white"
                    }`}
                  >
                    {/* Sample preview text rendered in this exact font */}
                    <span
                      className="text-lg font-bold text-ink mb-1 truncate w-full"
                      style={{ fontFamily: getFontFamily(opt.id) }}
                    >
                      Your name
                    </span>
                    <span className="text-xs font-bold text-ink/80">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-ink/50 mt-0.5">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Readability Blocking Error Banner */}
        {hasErrorIssues && (
          <div
            className="flex items-start gap-3 p-4 mt-8 rounded-2xl bg-coral/10 border border-coral/20 text-coral text-sm"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Contrast issues must be resolved to save</p>
              <p className="text-xs text-coral/80 mt-0.5">
                One or more color combinations have contrast below 3.0:1. Use the
                &quot;Fix&quot; buttons above to automatically set legible colors.
              </p>
            </div>
          </div>
        )}

        {/* General Error Message */}
        {generalError && (
          <div className="pt-6">
            <p className="text-sm text-coral font-medium" aria-live="polite">
              {generalError}
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-ink/5 mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || hasErrorIssues}
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
              className="text-ink/60 hover:text-ink font-bold text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-full cursor-pointer"
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
    </div>
  );
}
