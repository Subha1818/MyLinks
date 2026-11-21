"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { type LinkBlock } from "./link-row";

export type SocialBlock = {
  id: string;
  platform: string;
  title: string;
  url: string;
  position: number;
  isVisible: boolean;
};

export type DraftState = {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  username: string;
  theme: unknown;
  blocks: LinkBlock[];
  socials: SocialBlock[];
};

type DraftContextType = {
  draft: DraftState;
  updateProfile: (updates: Partial<Pick<DraftState, "displayName" | "bio" | "avatarUrl">>) => void;
  updateBlocks: (blocks: LinkBlock[]) => void;
  updateSocials: (socials: SocialBlock[]) => void;
  updateTheme: (theme: unknown) => void;
};

const PageDraftContext = createContext<DraftContextType | null>(null);

export function PageDraftProvider({
  initialState,
  children,
}: {
  initialState: DraftState;
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<DraftState>(initialState);
  const prevInitialState = useRef(initialState);

  useEffect(() => {
    setDraft((currentDraft) => {
      const nextDraft = { ...currentDraft };
      const prev = prevInitialState.current;

      // Only overwrite draft fields if the SERVER value actually changed.
      // This preserves unsaved keystrokes when unrelated server actions trigger router.refresh().
      if (initialState.displayName !== prev.displayName) nextDraft.displayName = initialState.displayName;
      if (initialState.bio !== prev.bio) nextDraft.bio = initialState.bio;
      if (initialState.avatarUrl !== prev.avatarUrl) nextDraft.avatarUrl = initialState.avatarUrl;
      if (JSON.stringify(initialState.theme) !== JSON.stringify(prev.theme)) nextDraft.theme = initialState.theme;
      if (JSON.stringify(initialState.blocks) !== JSON.stringify(prev.blocks)) nextDraft.blocks = initialState.blocks;
      if (JSON.stringify(initialState.socials) !== JSON.stringify(prev.socials)) nextDraft.socials = initialState.socials;

      return nextDraft;
    });

    prevInitialState.current = initialState;
  }, [initialState]);

  const updateProfile = (updates: Partial<Pick<DraftState, "displayName" | "bio" | "avatarUrl">>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const updateBlocks = (blocks: LinkBlock[]) => {
    setDraft((prev) => ({ ...prev, blocks }));
  };

  const updateSocials = (socials: SocialBlock[]) => {
    setDraft((prev) => ({ ...prev, socials }));
  };

  const updateTheme = (theme: unknown) => {
    setDraft((prev) => ({ ...prev, theme }));
  };

  return (
    <PageDraftContext.Provider
      value={{ draft, updateProfile, updateBlocks, updateSocials, updateTheme }}
    >
      {children}
    </PageDraftContext.Provider>
  );
}

export function usePageDraft() {
  const ctx = useContext(PageDraftContext);
  if (!ctx) {
    throw new Error("usePageDraft must be used within a PageDraftProvider");
  }
  return ctx;
}
