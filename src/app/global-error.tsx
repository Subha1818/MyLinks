"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error("[GlobalError] Fatal crash:", error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F4EF] text-[#14181F] flex flex-col items-center justify-center p-4 font-sans select-none text-center">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#FF5A36]/15 border-3 border-[#FF5A36] flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-[#FF5A36]" />
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-black tracking-tight mb-3 outline-none"
          >
            Something went wrong
          </h1>

          <p className="text-[#14181F]/70 font-medium text-base mb-6 max-w-sm">
            We encountered a fatal issue while loading the application. Please reload to try again.
          </p>

          {error.digest && (
            <p className="text-xs font-mono text-[#14181F]/50 bg-[#14181F]/5 px-3 py-1.5 rounded-lg mb-8 select-all">
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-[#14181F] text-[#F5F4EF] font-bold text-base h-12 px-6 rounded-full hover:bg-black transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
