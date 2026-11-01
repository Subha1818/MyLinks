"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Log error securely on client console / server telemetry only
    console.error("[RootError] Unhandled application error:", error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <main
      id="main-content"
      className="min-h-dvh bg-cream flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-tomato/15 border-3 border-tomato flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-tomato" />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading font-black text-3xl sm:text-4xl text-ink tracking-tight mb-3 outline-none"
        >
          Something went wrong
        </h1>

        <p className="text-ink/70 font-medium text-base mb-6 max-w-sm">
          We encountered an unexpected hiccup. Please try again or head back to the home page.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-ink/50 bg-ink/5 px-3 py-1.5 rounded-lg mb-8 select-all">
            Reference: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button
            type="button"
            variant="primary"
            size="48px"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="48px" className="w-full sm:w-auto px-6">
              <Home className="w-4 h-4" />
              Back to home
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-xs text-ink/40 font-semibold">
          {siteConfig.name} • Need help? Contact support
        </p>
      </div>
    </main>
  );
}
