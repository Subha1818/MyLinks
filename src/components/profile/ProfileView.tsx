import { resolveTheme, FontOption } from "@/lib/theme";
import { Avatar } from "@/components/ui/avatar";
import { isSafeHttpUrl } from "@/lib/safe-url";
import { siteConfig } from "@/lib/site";
import Link from "next/link";
import React from "react";

type ProfileViewProps = {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  links: { id: string; title: string; url: string }[];
  theme?: unknown;
  mode: "preview" | "public";
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
}: ProfileViewProps) {
  const resolvedTheme = resolveTheme(theme);

  const containerStyle = {
    "--theme-bg": resolvedTheme.background.value,
    "--theme-text": resolvedTheme.textColor,
    "--theme-btn-fill": resolvedTheme.button.fill,
    "--theme-btn-text": resolvedTheme.button.textColor,
    fontFamily: getFontFamily(resolvedTheme.font),
  } as React.CSSProperties;

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

  return (
    <div
      style={containerStyle}
      className="flex-1 min-h-full w-full bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col items-center px-4 py-12"
    >
      <div className="w-full max-w-[480px] flex flex-col items-center">
        <Avatar
          src={avatarUrl || undefined}
          fallback={displayName.slice(0, 2).toUpperCase() || "??"}
          size="lg"
          className="mb-4 shadow-sm"
        />
        <h1 className="text-xl font-bold text-center mb-2 max-w-full break-words">
          {displayName}
        </h1>
        {bio && (
          <p className="text-center text-sm mb-8 opacity-90 whitespace-pre-wrap max-w-full break-words">
            {bio}
          </p>
        )}

        <div className="w-full flex flex-col gap-4">
          {links.length === 0 ? (
            <div className="text-center text-sm font-bold opacity-70 py-8">
              Your links will appear here
            </div>
          ) : (
            links.map((link) => {
              const safeUrl = isSafeHttpUrl(link.url) ? link.url : undefined;

              if (!safeUrl) {
                if (mode === "public") return null;
                // In preview mode, render as disabled
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

        <div className="mt-12 text-xs font-bold opacity-60 uppercase tracking-widest">
          <Link href="/" className="hover:underline">
            Made with {siteConfig.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
