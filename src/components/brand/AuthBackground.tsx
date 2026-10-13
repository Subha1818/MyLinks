"use client";

import React from "react";

/**
 * Minimal abstract colorful SVGs framing the auth pages (Login & Onboarding)
 * Uses MyLinks brand palette: Lime, Forest, Lilac, Mustard, Mint, Tomato.
 */
export function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* 1. Top-Left: Brand 8-Point Star in Lime */}
      <svg
        className="absolute top-6 left-6 sm:top-12 sm:left-14 w-10 h-10 sm:w-14 sm:h-14 text-lime drop-shadow-[2px_2px_0px_#1F4D1A] transition-transform duration-500 hover:rotate-12"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L13.8 8.4L20.2 6.6L16 12L20.2 17.4L13.8 15.6L12 22L10.2 15.6L3.8 17.4L8 12L3.8 6.6L10.2 8.4L12 2Z" />
      </svg>

      {/* 2. Top-Left Floating Mint Ring */}
      <svg
        className="absolute top-24 left-16 sm:top-36 sm:left-32 w-6 h-6 sm:w-8 sm:h-8"
        viewBox="0 0 32 32"
        fill="none"
      >
        <circle cx="16" cy="16" r="12" stroke="#48B36D" strokeWidth="3" strokeDasharray="3 3" />
      </svg>

      {/* 3. Top-Right: Playful Mustard Sparkle / Burst */}
      <svg
        className="absolute top-8 right-8 sm:top-14 sm:right-20 w-8 h-8 sm:w-12 sm:h-12 text-mustard"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      {/* 4. Top-Right: Lilac Wavy Squiggle */}
      <svg
        className="absolute top-28 right-12 sm:top-40 sm:right-36 w-16 h-8 sm:w-20 sm:h-10 text-lilac"
        viewBox="0 0 60 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <path d="M4 10 Q 16 0, 28 10 T 56 10" />
      </svg>

      {/* 5. Bottom-Left: Rotated Lilac Pill Capsule with Mint Dot */}
      <div className="absolute bottom-10 left-8 sm:bottom-20 sm:left-24 flex items-center gap-2 -rotate-12">
        <div className="w-12 sm:w-16 h-5 sm:h-6 rounded-full bg-lilac border-2 border-ink/20 shadow-xs" />
        <div className="w-3.5 h-3.5 rounded-full bg-mint border-2 border-forest" />
      </div>

      {/* 6. Bottom-Left: Subtle Coral Plus Sign */}
      <svg
        className="absolute bottom-28 left-16 sm:bottom-44 sm:left-40 w-5 h-5 text-tomato/70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <path d="M12 5V19M5 12H19" />
      </svg>

      {/* 7. Bottom-Right: Forest & Lime Geometric Circle Cluster */}
      <svg
        className="absolute bottom-10 right-8 sm:bottom-16 sm:right-20 w-12 h-12 sm:w-16 sm:h-16"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle cx="24" cy="24" r="18" fill="#D2E823" stroke="#1F4D1A" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="7" fill="#1F4D1A" />
      </svg>

      {/* 8. Bottom-Right: Mustard Asterisk */}
      <svg
        className="absolute bottom-28 right-16 sm:bottom-40 sm:right-36 w-6 h-6 text-mustard"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="4.2" y1="7.5" x2="19.8" y2="16.5" />
        <line x1="4.2" y1="16.5" x2="19.8" y2="7.5" />
      </svg>

      {/* 9. Tiny playful ambient accents near edges */}
      <span className="absolute top-1/3 left-6 sm:left-12 text-forest/20 font-heading font-black text-xl sm:text-2xl select-none">
        ✦
      </span>
      <span className="absolute top-1/2 right-6 sm:right-16 text-forest/20 font-heading font-black text-lg sm:text-xl select-none">
        ✦
      </span>
    </div>
  );
}
