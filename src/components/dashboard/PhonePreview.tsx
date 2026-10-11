"use client";

import { useState } from "react";
import { usePageDraft } from "./PageDraftProvider";
import { ProfileView } from "@/components/profile/ProfileView";
import { getPublicUrlDisplay } from "@/lib/urls";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function PhonePreview() {
  const { draft } = usePageDraft();
  const [isOpen, setIsOpen] = useState(false);

  const visibleLinks = draft.blocks.filter((b) => b.isVisible);
  const publicUrlDisplay = getPublicUrlDisplay(draft.username);

  const previewFrame = (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h3 className="font-heading font-extrabold text-xl text-ink">
          Live preview
        </h3>
        <p className="text-xs font-bold text-ink/60 truncate max-w-[280px] mt-0.5">
          {publicUrlDisplay}
        </p>
      </div>

      <div className="relative w-[320px] h-[640px] rounded-[48px] bg-ink border-[8px] border-ink shadow-2xl shrink-0 overflow-hidden">
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
      <div className="hidden xl:block sticky top-8">{previewFrame}</div>

      {/* Mobile / Tablet Floating Button (floats cleanly above bottom tab bar) */}
      <div className="xl:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-40">
        <Button
          variant="primary"
          size="48px"
          onClick={() => setIsOpen(true)}
          className="shadow-xl"
        >
          <Eye className="w-5 h-5" />
          <span>Preview</span>
        </Button>
      </div>

      {/* Mobile / Tablet Modal Preview */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Live preview"
        description={publicUrlDisplay}
        maxWidth="md"
      >
        <div className="flex justify-center py-2">{previewFrame}</div>
      </Modal>
    </>
  );
}
