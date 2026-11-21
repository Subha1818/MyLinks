import { resolveTheme, FontOption, getThemeBackgroundStyle } from "@/lib/theme";
import { Avatar } from "@/components/ui/avatar";
import { isSafeHttpUrl } from "@/lib/safe-url";
import { isTrustedImageUrl } from "@/lib/urls";
import { siteConfig } from "@/lib/site";
import { StarMark } from "@/components/brand/StarMark";
import { readableTextOn } from "@/lib/color";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { detectPlatform } from "@/lib/platforms";
import Link from "next/link";
import React from "react";

export type ProfileViewLinkItem = {
  kind: "link";
  id: string;
  title: string;
  url: string;
  platform?: string | null;
  layout?: "classic" | "thumb" | "featured";
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  highlighted?: boolean;
};

export type ProfileViewHeaderItem = {
  kind: "header";
  id: string;
  title: string;
};

export type ProfileViewItem = ProfileViewLinkItem | ProfileViewHeaderItem;

export type ProfileViewLink = {
  id: string;
  title: string;
  url: string;
  platform?: string | null;
  layout?: "classic" | "thumb" | "featured";
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  highlighted?: boolean;
};

export type ProfileViewSocial = {
  id: string;
  platform: string;
  label: string;
};

type ProfileViewProps = {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  items?: ProfileViewItem[];
  links?: ProfileViewLink[];
  socials?: ProfileViewSocial[];
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
  items,
  links,
  socials = [],
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
      ? "rounded-[28px]"
      : resolvedTheme.button.shape === "rounded"
      ? "rounded-2xl"
      : "rounded-none";

  const thumbImgRadiusClass =
    resolvedTheme.button.shape === "pill"
      ? "rounded-full"
      : resolvedTheme.button.shape === "rounded"
      ? "rounded-xl"
      : "rounded-none";

  const featuredImgRadiusClass =
    resolvedTheme.button.shape === "pill"
      ? "rounded-t-[26px]"
      : resolvedTheme.button.shape === "rounded"
      ? "rounded-t-2xl"
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

  const baseBtnClass = `relative w-full font-bold transition-transform hover:scale-[1.02] active:scale-[0.99] ${
    resolvedTheme.button.style === "solid" ? "shadow-sm" : ""
  } ${buttonRadiusClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2`;

  // CTA readable color
  const ctaTextColor = readableTextOn(resolvedTheme.textColor);

  // Social icon filled glyph readable color
  const socialFilledGlyphColor = readableTextOn(resolvedTheme.textColor);

  // Resolve display items
  const displayItems: ProfileViewItem[] =
    items ||
    (links || []).map((l) => ({
      kind: "link" as const,
      id: l.id,
      title: l.title,
      url: l.url,
      platform: l.platform,
      layout: l.layout || "classic",
      thumbnailUrl: l.thumbnailUrl,
      thumbnailAlt: l.thumbnailAlt,
      highlighted: l.highlighted,
    }));

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
            className={`text-sm mb-4 opacity-90 whitespace-pre-wrap max-w-full break-words ${
              isLeftAlign ? "text-left" : "text-center"
            }`}
          >
            {bio}
          </p>
        )}

        {/* Social Icons Row (under bio, before link list) */}
        {socials.length > 0 && (
          <div
            className={`w-full flex flex-wrap gap-2.5 mb-8 ${
              isLeftAlign ? "justify-start" : "justify-center"
            }`}
          >
            {socials.map((social) => {
              const isFilled = resolvedTheme.layout.socialIcons === "filled";
              const itemClass = `w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 shrink-0 ${
                isFilled ? "shadow-2xs" : ""
              }`;

              const itemStyle: React.CSSProperties = isFilled
                ? {
                    backgroundColor: resolvedTheme.textColor,
                    color: socialFilledGlyphColor,
                  }
                : {
                    color: resolvedTheme.textColor,
                  };

              if (mode === "public") {
                return (
                  <a
                    key={social.id}
                    href={`/api/click/${social.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    className={itemClass}
                    style={itemStyle}
                    aria-label={social.label}
                    title={social.label}
                  >
                    <PlatformIcon platformKey={social.platform} size={24} />
                  </a>
                );
              }

              return (
                <div
                  key={social.id}
                  className={itemClass}
                  style={itemStyle}
                  aria-label={social.label}
                  title={social.label}
                >
                  <PlatformIcon platformKey={social.platform} size={24} />
                </div>
              );
            })}
          </div>
        )}

        {/* Items list (links & headers) */}
        <div className={`w-full flex flex-col ${spacingClass} ${socials.length === 0 ? "mt-4" : ""}`}>
          {displayItems.length === 0 ? (
            <div className="text-center text-sm font-bold opacity-70 py-8">
              Your links will appear here
            </div>
          ) : (
            displayItems.map((item) => {
              if (item.kind === "header") {
                return (
                  <h2
                    key={item.id}
                    className={`w-full text-lg sm:text-xl font-heading font-extrabold pt-4 pb-1 select-none ${
                      isLeftAlign ? "text-left" : "text-center"
                    }`}
                    style={{ color: resolvedTheme.textColor }}
                  >
                    {item.title}
                  </h2>
                );
              }

              if (!isSafeHttpUrl(item.url)) {
                return null;
              }

              const spotlightClass = item.highlighted ? "animate-spotlight" : "";
              const layout = item.layout || "classic";
              const hasTrustedImg = isTrustedImageUrl(item.thumbnailUrl);

              let cardContent: React.ReactNode = null;
              let cardLayoutClass = "";

              if (layout === "featured" && hasTrustedImg) {
                cardLayoutClass = "flex flex-col overflow-hidden group";
                cardContent = (
                  <>
                    <div className="w-full aspect-[16/10] overflow-hidden shrink-0 bg-black/5">
                      <img
                        src={item.thumbnailUrl!}
                        alt={item.thumbnailAlt || ""}
                        width={1000}
                        height={625}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none ${featuredImgRadiusClass}`}
                      />
                    </div>
                    <div
                      className={`w-full px-5 py-4 ${
                        isLeftAlign ? "text-left" : "text-center"
                      }`}
                    >
                      <span className="block truncate text-base">{item.title}</span>
                    </div>
                  </>
                );
              } else if (layout === "thumb" && hasTrustedImg) {
                cardLayoutClass = "flex items-center justify-center px-4 py-3.5 min-h-[56px] sm:min-h-[60px]";
                cardContent = (
                  <>
                    <img
                      src={item.thumbnailUrl!}
                      alt={item.thumbnailAlt || item.title || ""}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 object-cover absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 ${thumbImgRadiusClass}`}
                    />
                    <span
                      className={`truncate text-base font-semibold ${
                        isLeftAlign ? "pl-12 sm:pl-14 pr-4" : "px-12 sm:px-14"
                      }`}
                    >
                      {item.title}
                    </span>
                  </>
                );
              } else {
                // Classic layout (or fallback if no image)
                const platformKey =
                  item.platform || (item.url ? detectPlatform(item.url) : null);
                const showIcon =
                  resolvedTheme.layout.linkIcons !== "off" && !!platformKey;

                cardLayoutClass = "flex items-center justify-center px-4 py-3.5 min-h-[52px]";
                cardContent = (
                  <>
                    {showIcon && (
                      <div
                        className={`absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 border border-current/20 bg-current/[0.06] ${thumbImgRadiusClass}`}
                        aria-hidden="true"
                      >
                        <PlatformIcon platformKey={platformKey} size={20} />
                      </div>
                    )}
                    <span
                      className={`truncate text-base font-semibold ${
                        showIcon ? (isLeftAlign ? "pl-12 sm:pl-14 pr-4" : "px-12 sm:px-14") : "px-4"
                      }`}
                    >
                      {item.title}
                    </span>
                  </>
                );
              }

              const combinedBtnClass = `${baseBtnClass} ${cardLayoutClass} ${spotlightClass}`;

              if (mode === "preview") {
                return (
                  <div
                    key={item.id}
                    className={combinedBtnClass}
                    style={buttonStyleCSS}
                    aria-disabled="true"
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={`/api/click/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className={combinedBtnClass}
                  style={buttonStyleCSS}
                >
                  {cardContent}
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
