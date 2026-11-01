"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { StarMark } from "@/components/brand/StarMark";
import { Button } from "@/components/ui/button";
import { Home, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main
      id="main-content"
      className="min-h-dvh bg-cream flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Large Forest Star inside Lime Circle */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-lime border-3 border-forest flex items-center justify-center shadow-[4px_4px_0px_#1F4D1A] mb-6">
          <StarMark className="w-10 h-10 sm:w-12 sm:h-12 text-forest" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-forest/70 bg-lime/60 px-3 py-1 rounded-full mb-3 border border-forest/15">
          404 Error
        </span>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading font-black text-3xl sm:text-4xl text-ink tracking-tight mb-3 outline-none"
        >
          This page wandered off
        </h1>

        <p className="text-ink/70 font-medium text-base mb-8 max-w-sm">
          The link you followed might be broken, or the page may have been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="48px" className="w-full sm:w-auto px-6">
              <Home className="w-4 h-4" />
              Back to home
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="accent" size="48px" className="w-full sm:w-auto px-6">
              <Sparkles className="w-4 h-4" />
              Claim your link
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-xs text-ink/40 font-semibold">
          {siteConfig.name} • All systems operational
        </p>
      </div>
    </main>
  );
}
