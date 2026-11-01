import { resolveTheme, FontOption, getThemeBackgroundStyle } from "@/lib/theme";
import { Avatar } from "@/components/ui/avatar";
import { isSafeHttpUrl } from "@/lib/safe-url";
import { siteConfig } from "@/lib/site";
import { StarMark } from "@/components/brand/StarMark";
import { readableTextOn } from "@/lib/color";
import Link from "next/link";
import React from "react";

type ProfileViewProps = {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  links: { id: string; title: string; url: string }[];
  theme?: unknown;
  mode: "preview" | "public";
  footer?: React.ReactNode;
};

export function getFontFamily(font: FontOption): string {
  switch (font) {
    case "bricolage":
      return "var(--font-bricolage), system-ui, sans-serif";
    case "dm-sans":
      return "var(--font-dm-sans), system-ui, sans-serif";
    case "fraunces":
      return "var(--font-fraunces), Georgia, serif";
    case "dm-mono":
      return "var(--font-dm-mono), Menlo, monospace";
    case "archivo":
      return "var(--font-archivo), system-ui, sans-serif";
    case "caveat":
      return "var(--font-caveat), cursive";
    default:
      return "var(--font-bricolage), system-ui, sans-serif";
  }
}

export function ProfileView({
  displayName,
  bio,
  avatarUrl,
  links,
  theme,
  mode,
  footer,
}: ProfileViewProps) {
  const resolvedTheme = resolveTheme(theme);
  const bgStyle = getThemeBackgroundStyle(resolvedTheme.background);

  const containerStyle: React.CSSProperties = {
    ...bgStyle,
    color: resolvedTheme.textColor,
    fontFamily: getFontFamily(resolvedTheme.font),
    paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
  };

  const isLeftAlign = resolvedTheme.layout.align === "left";
  const avatarShape = resolvedTheme.layout.avatarShape;
  const spacingClass =
    resolvedTheme.layout.spacing === "compact"
      ? "gap-2.5"
      : resolvedTheme.layout.spacing === "relaxed"
      ? "gap-6"
      : "gap-4";

  const buttonRadiusClass =
    resolvedTheme.button.shape === "pill"
      ? "rounded-full"
      : resolvedTheme.button.shape === "rounded"
      ? "rounded-xl"
      : "rounded-none";

  const buttonStyleCSS: React.CSSProperties =
    resolvedTheme.button.style === "outline"
      ? {
          backgroundColor: "transparent",
          color: resolvedTheme.button.textColor,
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: resolvedTheme.button.fill,
        }
      : resolvedTheme.button.style === "hard-shadow"
      ? {
          backgroundColor: resolvedTheme.button.fill,
          color: resolvedTheme.button.textColor,
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: resolvedTheme.button.textColor,
          boxShadow: `4px 4px 0px ${resolvedTheme.button.textColor}`,
        }
      : {
          backgroundColor: resolvedTheme.button.fill,
          color: resolvedTheme.button.textColor,
        };

  const btnClass = `block w-full text-center px-6 py-4 font-bold transition-transform hover:scale-[1.02] ${
    resolvedTheme.button.style === "solid" ? "shadow-sm" : ""
  } ${buttonRadiusClass} truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2`;

  // Determine readable text color on the CTA pill (pill bg = theme's textColor)
  const ctaTextColor = readableTextOn(resolvedTheme.textColor);

  return (
    <div
      style={containerStyle}
      className="flex-1 min-h-full w-full flex flex-col items-center px-4 pt-12"
    >
      <div
        className={`w-full max-w-[480px] flex flex-col ${
          isLeftAlign ? "items-start text-left" : "items-center text-center"
        }`}
      >
        <Avatar
          src={avatarUrl || undefined}
          fallback={displayName.slice(0, 2).toUpperCase() || "??"}
          size="lg"
          shape={avatarShape}
          className="mb-4 shadow-sm"
        />
        <h1
          className={`text-xl font-bold mb-2 max-w-full break-words ${
            isLeftAlign ? "text-left" : "text-center"
          }`}
        >
          {displayName}
        </h1>
        {bio && (
          <p
            className={`text-sm mb-8 opacity-90 whitespace-pre-wrap max-w-full break-words ${
              isLeftAlign ? "text-left" : "text-center"
            }`}
          >
            {bio}
          </p>
        )}

        {/* Links list */}
        <div className={`w-full flex flex-col ${spacingClass}`}>
          {links.length === 0 ? (
            <div className="text-center text-sm font-bold opacity-70 py-8">
              Your links will appear here
            </div>
          ) : (
            links.map((link) => {
              if (!isSafeHttpUrl(link.url)) {
                return null;
              }

              if (mode === "preview") {
                return (
                  <div
                    key={link.id}
                    className={btnClass}
                    style={buttonStyleCSS}
                    aria-disabled="true"
                  >
                    {link.title}
                  </div>
                );
              }

              return (
                <a
                  key={link.id}
                  href={`/api/click/${link.id}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className={btnClass}
                  style={buttonStyleCSS}
                >
                  {link.title}
                </a>
              );
            })
          )}
        </div>

        {/* Call to action & footer (anchored horizontally centered regardless of layout.align) */}
        <div className="mt-14 w-full flex flex-col items-center select-none">
          {mode === "public" ? (
            <Link
              href="/"
              className="group w-full max-w-[320px] h-[52px] px-4 rounded-full flex items-center justify-center gap-3 transition-transform duration-150 hover:-translate-y-[1px] active:translate-y-0 motion-reduce:transform-none shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 cursor-pointer"
              style={{
                backgroundColor: resolvedTheme.textColor,
                color: ctaTextColor,
              }}
              aria-label={`${siteConfig.ctaLabel} - ${siteConfig.ctaSubtext}`}
            >
              <div className="shrink-0 transition-transform duration-500 group-hover:rotate-180 motion-reduce:transition-none motion-reduce:transform-none">
                <StarMark className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start justify-center leading-none text-left">
                <span className="font-heading font-extrabold text-sm tracking-tight">
                  {siteConfig.ctaLabel}
                </span>
                <span className="text-[11px] font-medium opacity-80 mt-1">
                  {siteConfig.ctaSubtext}
                </span>
              </div>
            </Link>
          ) : (
            <div
              aria-hidden="true"
              className="w-full max-w-[320px] h-[52px] px-4 rounded-full flex items-center justify-center gap-3 shadow-xs pointer-events-none"
              style={{
                backgroundColor: resolvedTheme.textColor,
                color: ctaTextColor,
              }}
            >
              <div className="shrink-0">
                <StarMark className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start justify-center leading-none text-left">
                <span className="font-heading font-extrabold text-sm tracking-tight">
                  {siteConfig.ctaLabel}
                </span>
                <span className="text-[11px] font-medium opacity-80 mt-1">
                  {siteConfig.ctaSubtext}
                </span>
              </div>
            </div>
          )}

          {/* Footer Slot */}
          <div className="mt-3.5 w-full flex items-center justify-center">
            {footer ? (
              footer
            ) : (
              <div
                className="text-xs font-semibold flex items-center justify-center gap-2 select-none opacity-70"
                style={{ color: resolvedTheme.textColor }}
              >
                <span>Report</span>
                <span className="opacity-40">·</span>
                <span>Privacy</span>
                <span className="opacity-40">·</span>
                <span>Terms</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
