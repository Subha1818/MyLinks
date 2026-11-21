"use client";

import { usePageDraft } from "./PageDraftProvider";
import { ProfileView } from "@/components/profile/ProfileView";
import { getPublicUrlDisplay } from "@/lib/urls";
import { detectPlatform } from "@/lib/platforms";

function PhoneFrame({ scale = 1 }: { scale?: number }) {
  const { draft } = usePageDraft();
  const visibleItems = (draft.blocks || [])
    .filter((b) => b.isVisible)
    .map((b) => {
      if (b.type === "header") {
        return {
          kind: "header" as const,
          id: b.id,
          title: b.title,
        };
      }
      return {
        kind: "link" as const,
        id: b.id,
        title: b.title,
        url: b.url || "",
        platform: b.platform || (b.url ? detectPlatform(b.url) : null) || undefined,
        layout: b.layout || "classic",
        thumbnailUrl: b.thumbnailUrl,
        thumbnailAlt: b.thumbnailAlt,
        highlighted: b.isHighlighted,
      };
    });

  const visibleSocials = (draft.socials || [])
    .filter((s) => s.isVisible)
    .map((s) => ({
      id: s.id,
      platform: s.platform,
      label: s.title,
    }));

  return (
    <div
      className="relative w-[320px] h-[640px] rounded-[48px] bg-ink border-[8px] border-ink shadow-2xl shrink-0 overflow-hidden"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
        <div className="w-28 h-6 bg-ink rounded-b-3xl"></div>
      </div>
      <div
        className="w-full h-full bg-white rounded-[38px] overflow-y-auto no-scrollbar relative"
        // @ts-expect-error React 19 supports inert
        inert=""
        aria-hidden="true"
      >
        <ProfileView
          mode="preview"
          displayName={draft.displayName}
          bio={draft.bio}
          avatarUrl={draft.avatarUrl}
          items={visibleItems}
          socials={visibleSocials}
          theme={draft.theme}
        />
      </div>
    </div>
  );
}

export function PhonePreview() {
  const { draft } = usePageDraft();
  const publicUrlDisplay = getPublicUrlDisplay(draft.username);

  return (
    <div className="hidden xl:block sticky top-8">
      <div className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <h3 className="font-heading font-extrabold text-xl text-ink">
            Live preview
          </h3>
          <p className="text-xs font-bold text-ink/60 truncate max-w-[280px] mt-0.5">
            {publicUrlDisplay}
          </p>
        </div>
        <PhoneFrame />
      </div>
    </div>
  );
}

/**
 * Compact inline phone preview — shown only on mobile (< xl) between the
 * Appearance page header and the theme selector. Renders at ~55% scale so
 * it fits nicely in a mobile viewport without scrolling too much.
 */
export function MobileInlinePhonePreview() {
  const { draft } = usePageDraft();
  const publicUrlDisplay = getPublicUrlDisplay(draft.username);
  return (
    <div className="xl:hidden mb-6">
      <p className="text-xs font-bold text-ink/50 text-center mb-3 truncate">
        {publicUrlDisplay}
      </p>
      {/* Scale container: phone is 320px wide, we want ~260px on screen */}
      <div className="flex justify-center" style={{ height: "360px" }}>
        <PhoneFrame scale={0.55} />
      </div>
    </div>
  );
}
