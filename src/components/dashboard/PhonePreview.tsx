"use client";

import { useState, useEffect } from "react";
import { usePageDraft } from "./PageDraftProvider";
import { ProfileView } from "@/components/profile/ProfileView";
import { siteConfig } from "@/lib/site";
import { X, Eye } from "lucide-react";

export function PhonePreview() {
  const { draft } = usePageDraft();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const visibleLinks = draft.blocks.filter((b) => b.isVisible);

  const previewContent = (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h3 className="font-heading font-bold text-lg text-ink">
          Live preview
        </h3>
        <p className="text-sm font-bold text-ink/60">
          {siteConfig.domain}/{draft.username}
        </p>
      </div>

      <div className="relative w-[320px] h-[640px] rounded-[48px] bg-ink border-[8px] border-ink shadow-2xl flex-shrink-0 overflow-hidden">
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
            links={visibleLinks}
            theme={draft.theme}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* xl Desktop view (sticky) */}
      <div className="hidden xl:block sticky top-8">
        {previewContent}
      </div>

      {/* Mobile / Tablet Floating Button */}
      <div className="xl:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-ink text-cream px-5 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
        >
          <Eye className="w-5 h-5" />
          Preview
        </button>
      </div>

      {/* Mobile / Tablet Fullscreen Modal */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-cream/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-3 bg-ink/10 text-ink rounded-full hover:bg-ink/20 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="mt-8">
            {previewContent}
          </div>
        </div>
      )}
    </>
  );
}
