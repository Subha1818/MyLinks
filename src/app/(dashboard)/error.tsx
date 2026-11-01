"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error("[DashboardError]:", error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <div className="w-full max-w-xl mx-auto py-12">
      <Card className="flex flex-col items-center justify-center text-center p-8 sm:p-10 border-hairline shadow-sm">
        <div className="w-16 h-16 bg-tomato/15 border-2 border-tomato rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-tomato" />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight mb-2 outline-none"
        >
          Dashboard error
        </h1>

        <p className="text-ink/70 font-medium text-sm sm:text-base mb-6 max-w-md">
          We encountered an unexpected error while loading this page. Please reload or return home.
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
            Reload dashboard
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="48px" className="w-full sm:w-auto px-6">
              <Home className="w-4 h-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
