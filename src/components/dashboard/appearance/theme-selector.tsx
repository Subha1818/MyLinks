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
  GradientDirection,
  PatternKind,
  PatternSize,
  LayoutAlign,
  AvatarShape,
  Spacing,
  getThemeBackgroundStyle,
} from "@/lib/theme";
import {
  normalizeHex,
  readableTextOn,
  readableTextOnBackground,
  getThemeReadabilityIssues,
  ReadabilityIssue,
} from "@/lib/color";
import { getFontFamily } from "@/components/profile/ProfileView";
import { updateTheme as updateThemeAction } from "@/server/actions/theme";
import { Check, AlertCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Check background
  if (a.background.type !== b.background.type) return false;
  if (a.background.type === "solid" && b.background.type === "solid") {
    if (a.background.value.toLowerCase() !== b.background.value.toLowerCase()) return false;
  } else if (a.background.type === "gradient" && b.background.type === "gradient") {
    if (
      a.background.from.toLowerCase() !== b.background.from.toLowerCase() ||
      a.background.to.toLowerCase() !== b.background.to.toLowerCase() ||
      a.background.direction !== b.background.direction
    ) {
      return false;
    }
  } else if (a.background.type === "pattern" && b.background.type === "pattern") {
    if (
      a.background.base.toLowerCase() !== b.background.base.toLowerCase() ||
      a.background.color.toLowerCase() !== b.background.color.toLowerCase() ||
      a.background.kind !== b.background.kind ||
      a.background.size !== b.background.size
    ) {
      return false;
    }
  }

  // Check text, button, font
  if (a.textColor.toLowerCase() !== b.textColor.toLowerCase()) return false;
  if (a.button.shape !== b.button.shape) return false;
  if (a.button.style !== b.button.style) return false;
  if (a.button.fill.toLowerCase() !== b.button.fill.toLowerCase()) return false;
  if (a.button.textColor.toLowerCase() !== b.button.textColor.toLowerCase()) return false;
  if (a.font !== b.font) return false;

  // Check layout
  if (
    a.layout.align !== b.layout.align ||
    a.layout.avatarShape !== b.layout.avatarShape ||
    a.layout.spacing !== b.layout.spacing
  ) {
    return false;
  }

  return true;
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

  const handleSwatchClick = (hex: string) => {
    setTypedText(null);
    onChange(hex);
  };

  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-[20px] bg-cream border border-hairline">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-ink/75">
          {label}
        </label>
        {issue && onFix && (
          <button
            type="button"
            onClick={onFix}
            title="Auto-fix contrast"
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-forest text-lime hover:bg-[#183d14] transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <Wand2 className="w-3 h-3" />
            <span>Fix</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          aria-label={`Open color picker for ${label}`}
          className="w-10 h-10 rounded-[14px] border border-hairline shrink-0 cursor-pointer shadow-xs transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          style={{ backgroundColor: normalizeHex(displayHex) || "#FFFFFF" }}
        />
        <input
          ref={colorInputRef}
          type="color"
          tabIndex={-1}
          value={normalizeHex(displayHex) || "#FFFFFF"}
          onChange={handleNativeColorChange}
          className="sr-only"
        />

        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            value={displayHex}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            maxLength={7}
            placeholder="#000000"
            className={`w-full font-mono text-xs font-bold px-3 py-2.5 rounded-[14px] bg-white border ${isValidHex ? "border-hairline focus:border-forest" : "border-tomato text-tomato"
              } text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest transition-colors`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {BRAND_PALETTE.map((hex) => {
          const isSelected = value.toUpperCase() === hex.toUpperCase();
          return (
            <button
              key={hex}
              type="button"
              onClick={() => handleSwatchClick(hex)}
              aria-label={`Select ${hex} for ${label}`}
              className={`w-5 h-5 rounded-md border cursor-pointer transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest ${isSelected ? "border-ink ring-2 ring-forest ring-offset-1" : "border-ink/20"
                }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
      </div>

      {issue && (
        <div
          className={`flex items-start gap-1.5 text-[11px] font-bold mt-1 ${issue.level === "error" ? "text-coral" : "text-amber-700"
            }`}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{issue.message}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Theme Selector Component
// ---------------------------------------------------------------------------
interface ThemeSelectorProps {
  initialTheme: unknown;
}

export function ThemeSelector({ initialTheme }: ThemeSelectorProps) {
  const router = useRouter();
  const { draft, updateTheme } = usePageDraft();

  const savedTheme = resolveTheme(initialTheme);
  const resolvedDraftTheme = resolveTheme(draft.theme);

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const presetCardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const fontCardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const matchingPreset = THEME_PRESETS.find((p) =>
    isThemeEqual(p.theme, resolvedDraftTheme)
  );
  const selectedPresetId = matchingPreset ? matchingPreset.id : null;

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

  // Handlers for preset and theme adjustments
  const handleSelectPreset = (preset: ThemePreset) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme(preset.theme);
  };

  // Background type switching with sensible defaults
  const handleUpdateBackgroundType = (type: "solid" | "gradient" | "pattern") => {
    setIsSuccess(false);
    setGeneralError(null);
    const current = resolvedDraftTheme.background;

    if (type === "solid") {
      const val = current.type === "solid" ? current.value : current.type === "gradient" ? current.from : current.base;
      updateTheme({
        ...resolvedDraftTheme,
        background: { type: "solid", value: val },
      });
    } else if (type === "gradient") {
      const from = current.type === "solid" ? current.value : current.type === "gradient" ? current.from : current.base;
      const to = current.type === "gradient" ? current.to : current.type === "pattern" ? current.color : readableTextOn(from) === "#FFFFFF" ? "#14181F" : "#FFFFFF";
      updateTheme({
        ...resolvedDraftTheme,
        background: {
          type: "gradient",
          from,
          to,
          direction: current.type === "gradient" ? current.direction : "diagonal",
        },
      });
    } else if (type === "pattern") {
      const base = current.type === "solid" ? current.value : current.type === "gradient" ? current.from : current.base;
      const color = current.type === "pattern" ? current.color : current.type === "gradient" ? current.to : readableTextOn(base);
      updateTheme({
        ...resolvedDraftTheme,
        background: {
          type: "pattern",
          base,
          color,
          kind: current.type === "pattern" ? current.kind : "dots",
          size: current.type === "pattern" ? current.size : "medium",
        },
      });
    }
  };

  const handleUpdateSolidBackground = (hex: string) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      background: { type: "solid", value: hex },
    });
  };

  const handleUpdateGradient = (key: "from" | "to", hex: string) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (resolvedDraftTheme.background.type !== "gradient") return;
    updateTheme({
      ...resolvedDraftTheme,
      background: {
        ...resolvedDraftTheme.background,
        [key]: hex,
      },
    });
  };

  const handleUpdateGradientDirection = (direction: GradientDirection) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (resolvedDraftTheme.background.type !== "gradient") return;
    updateTheme({
      ...resolvedDraftTheme,
      background: {
        ...resolvedDraftTheme.background,
        direction,
      },
    });
  };

  const handleUpdatePatternColor = (key: "base" | "color", hex: string) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (resolvedDraftTheme.background.type !== "pattern") return;
    updateTheme({
      ...resolvedDraftTheme,
      background: {
        ...resolvedDraftTheme.background,
        [key]: hex,
      },
    });
  };

  const handleUpdatePatternKind = (kind: PatternKind) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (resolvedDraftTheme.background.type !== "pattern") return;
    updateTheme({
      ...resolvedDraftTheme,
      background: {
        ...resolvedDraftTheme.background,
        kind,
      },
    });
  };

  const handleUpdatePatternSize = (size: PatternSize) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (resolvedDraftTheme.background.type !== "pattern") return;
    updateTheme({
      ...resolvedDraftTheme,
      background: {
        ...resolvedDraftTheme.background,
        size,
      },
    });
  };

  const handleUpdateColor = (
    key: "textColor" | "buttonFill" | "buttonTextColor",
    value: string
  ) => {
    setIsSuccess(false);
    setGeneralError(null);
    if (key === "textColor") {
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

  const handleUpdateLayoutAlign = (align: LayoutAlign) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      layout: {
        ...resolvedDraftTheme.layout,
        align,
      },
    });
  };

  const handleUpdateAvatarShape = (avatarShape: AvatarShape) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      layout: {
        ...resolvedDraftTheme.layout,
        avatarShape,
      },
    });
  };

  const handleUpdateSpacing = (spacing: Spacing) => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme({
      ...resolvedDraftTheme,
      layout: {
        ...resolvedDraftTheme.layout,
        spacing,
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
    const optimalColor = readableTextOnBackground(resolvedDraftTheme.background);
    handleUpdateColor("textColor", optimalColor);
  };

  const handleFixButtonContrast = () => {
    const isOutline = resolvedDraftTheme.button.style === "outline";
    const optimalColor = isOutline
      ? readableTextOnBackground(resolvedDraftTheme.background)
      : readableTextOn(resolvedDraftTheme.button.fill);
    handleUpdateColor("buttonTextColor", optimalColor);
  };

  // Keyboard navigation for radio groups
  const handlePresetKeyDown = (e: React.KeyboardEvent, index: number) => {
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
      handleSelectPreset(THEME_PRESETS[nextIndex]);
      presetCardsRef.current[nextIndex]?.focus();
    }
  };

  const handleFontKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % FONT_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + FONT_OPTIONS.length) % FONT_OPTIONS.length;
    }

    if (nextIndex !== index) {
      handleUpdateFont(FONT_OPTIONS[nextIndex].id);
      fontCardsRef.current[nextIndex]?.focus();
    }
  };

  // Save and reset actions
  const handleSave = async () => {
    if (hasErrorIssues) {
      setGeneralError("Please fix contrast issues before saving.");
      return;
    }

    setIsSaving(true);
    setGeneralError(null);
    setIsSuccess(false);

    try {
      const res = await updateThemeAction(resolvedDraftTheme);
      if (res.ok) {
        setIsSuccess(true);
        router.refresh();
      } else {
        setGeneralError(res.message);
      }
    } catch {
      setGeneralError("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setGeneralError(null);
    updateTheme(savedTheme);
  };

  const bg = resolvedDraftTheme.background;

  return (
    <div className="space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Presets Card                                                   */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <div className="pb-6 border-b border-ink/5">
          <h2 className="font-heading font-black text-xl text-ink">Presets</h2>
          <p className="text-sm text-ink/60 font-medium mt-1">
            Pick a designer-curated palette or customize individual options below.
          </p>
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

            const swatchGap =
              preset.theme.layout.spacing === "compact"
                ? "gap-1"
                : preset.theme.layout.spacing === "relaxed"
                  ? "gap-2"
                  : "gap-1.5";

            const swatchAvatarShape =
              preset.theme.layout.avatarShape === "rounded"
                ? "rounded-md"
                : preset.theme.layout.avatarShape === "square"
                  ? "rounded-none"
                  : "rounded-full";

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
                className={`group flex flex-col items-center gap-2.5 p-2.5 rounded-2xl transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${isSelected
                    ? "ring-2 ring-forest ring-offset-2 bg-forest/5"
                    : "hover:bg-ink/5"
                  }`}
              >
                {/* Mini phone-shaped swatch with real background rendering */}
                <div
                  className="w-full aspect-[9/14] rounded-xl p-2.5 flex flex-col items-center justify-between shadow-xs relative overflow-hidden border border-ink/10 transition-transform group-hover:scale-[1.02]"
                  style={getThemeBackgroundStyle(preset.theme.background)}
                >
                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-forest text-cream flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Tiny avatar */}
                  <div
                    className={`w-5 h-5 flex-shrink-0 mt-2 shadow-xs ${swatchAvatarShape}`}
                    style={{
                      backgroundColor: preset.theme.button.fill,
                      border:
                        preset.theme.button.style === "solid"
                          ? "1px solid rgba(0,0,0,0.08)"
                          : undefined,
                    }}
                  />

                  {/* Three small buttons drawn with the preset's real shape/style/colors */}
                  <div className={`w-full flex flex-col ${swatchGap} mb-2 px-1`}>
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
                    className={`text-sm font-bold ${isSelected ? "text-forest font-black" : "text-ink"
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
            Fine-tune backgrounds, colors, layout, and typography.
          </p>
        </div>

        <div className="space-y-8 pt-6">
          {/* Background Section */}
          <section aria-labelledby="bg-heading" className="space-y-4">
            <h3 id="bg-heading" className="text-base font-heading font-bold text-ink">
              Background
            </h3>

            {/* Background Type Segmented Control */}
            <div className="space-y-2">
              <span id="bg-type-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Type
              </span>
              <div
                role="radiogroup"
                aria-labelledby="bg-type-label"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
              >
                {(
                  [
                    { id: "solid", label: "Solid" },
                    { id: "gradient", label: "Gradient" },
                    { id: "pattern", label: "Pattern" },
                  ] as const
                ).map((opt) => {
                  const isSelected = bg.type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleUpdateBackgroundType(opt.id)}
                      className={`py-2 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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

            {/* Conditional Background Controls */}
            {bg.type === "solid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <ColorControl
                  id="solid-bg-color"
                  label="Background color"
                  value={bg.value}
                  onChange={handleUpdateSolidBackground}
                  issue={pageIssue}
                  onFix={pageIssue ? handleFixPageContrast : undefined}
                />
              </div>
            )}

            {bg.type === "gradient" && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorControl
                    id="grad-from"
                    label="From color"
                    value={bg.from}
                    onChange={(hex) => handleUpdateGradient("from", hex)}
                    issue={pageIssue}
                    onFix={pageIssue ? handleFixPageContrast : undefined}
                  />
                  <ColorControl
                    id="grad-to"
                    label="To color"
                    value={bg.to}
                    onChange={(hex) => handleUpdateGradient("to", hex)}
                    issue={pageIssue}
                    onFix={pageIssue ? handleFixPageContrast : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <span id="grad-dir-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                    Direction
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="grad-dir-label"
                    className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
                  >
                    {(
                      [
                        { id: "vertical", label: "Vertical" },
                        { id: "diagonal", label: "Diagonal" },
                        { id: "horizontal", label: "Horizontal" },
                      ] as const
                    ).map((opt) => {
                      const isSelected = bg.direction === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleUpdateGradientDirection(opt.id)}
                          className={`py-2 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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
              </div>
            )}

            {bg.type === "pattern" && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorControl
                    id="pat-base"
                    label="Base color"
                    value={bg.base}
                    onChange={(hex) => handleUpdatePatternColor("base", hex)}
                    issue={pageIssue}
                    onFix={pageIssue ? handleFixPageContrast : undefined}
                  />
                  <ColorControl
                    id="pat-color"
                    label="Pattern color (18% opacity)"
                    value={bg.color}
                    onChange={(hex) => handleUpdatePatternColor("color", hex)}
                    issue={pageIssue}
                    onFix={pageIssue ? handleFixPageContrast : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <span id="pat-kind-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                    Pattern kind
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="pat-kind-label"
                    className="grid grid-cols-4 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
                  >
                    {(
                      [
                        { id: "dots", label: "Dots" },
                        { id: "stripes", label: "Stripes" },
                        { id: "grid", label: "Grid" },
                        { id: "checks", label: "Checks" },
                      ] as const
                    ).map((opt) => {
                      const isSelected = bg.kind === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleUpdatePatternKind(opt.id)}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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

                <div className="space-y-2">
                  <span id="pat-size-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                    Pattern size
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="pat-size-label"
                    className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
                  >
                    {(
                      [
                        { id: "small", label: "Small (16px)" },
                        { id: "medium", label: "Medium (28px)" },
                        { id: "large", label: "Large (44px)" },
                      ] as const
                    ).map((opt) => {
                      const isSelected = bg.size === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleUpdatePatternSize(opt.id)}
                          className={`py-2 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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
              </div>
            )}
          </section>

          {/* Colors Section */}
          <section aria-labelledby="colors-heading" className="space-y-4 pt-4 border-t border-ink/5">
            <h3
              id="colors-heading"
              className="text-base font-heading font-bold text-ink"
            >
              Colors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorControl
                id="text-color"
                label="Page text color"
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

          {/* Layout Section */}
          <section aria-labelledby="layout-heading" className="space-y-6 pt-4 border-t border-ink/5">
            <h3 id="layout-heading" className="text-base font-heading font-bold text-ink">
              Layout
            </h3>

            {/* Alignment */}
            <div className="space-y-2">
              <span id="align-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Alignment
              </span>
              <div
                role="radiogroup"
                aria-labelledby="align-label"
                className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
              >
                {(
                  [
                    { id: "center", label: "Center" },
                    { id: "left", label: "Left" },
                  ] as const
                ).map((opt) => {
                  const isSelected = resolvedDraftTheme.layout.align === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleUpdateLayoutAlign(opt.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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

            {/* Avatar Shape */}
            <div className="space-y-2">
              <span id="avatar-shape-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Avatar shape
              </span>
              <div
                role="radiogroup"
                aria-labelledby="avatar-shape-label"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
              >
                {(
                  [
                    { id: "circle", label: "Circle" },
                    { id: "rounded", label: "Rounded" },
                    { id: "square", label: "Square" },
                  ] as const
                ).map((opt) => {
                  const isSelected = resolvedDraftTheme.layout.avatarShape === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleUpdateAvatarShape(opt.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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

            {/* Spacing */}
            <div className="space-y-2">
              <span id="spacing-label" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Button spacing
              </span>
              <div
                role="radiogroup"
                aria-labelledby="spacing-label"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-ink/[0.04] border border-ink/5"
              >
                {(
                  [
                    { id: "compact", label: "Compact" },
                    { id: "normal", label: "Normal" },
                    { id: "relaxed", label: "Relaxed" },
                  ] as const
                ).map((opt) => {
                  const isSelected = resolvedDraftTheme.layout.spacing === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleUpdateSpacing(opt.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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
                      className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isSelected
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
                    className={`flex flex-col items-start p-4 rounded-2xl border transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${isSelected
                        ? "border-forest bg-forest/5 ring-1 ring-forest"
                        : "border-ink/10 hover:border-ink/25 bg-white"
                      }`}
                  >
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
          <Button
            variant="primary"
            size="48px"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || hasErrorIssues}
            isLoading={isSaving}
          >
            Save theme
          </Button>

          {hasChanges && !isSaving && (
            <Button
              variant="ghost"
              size="48px"
              onClick={handleReset}
            >
              Reset
            </Button>
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
