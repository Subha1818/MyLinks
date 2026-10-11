"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { ArrowRight } from "lucide-react";
import { StarSpinner } from "@/components/brand/StarLoader";

export function ClaimForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    startTransition(() => {
      if (cleanUsername) {
        router.push(`/login?username=${encodeURIComponent(cleanUsername)}`);
      } else {
        router.push(`/login`);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md sm:max-w-lg mt-8"
      role="search"
      aria-label="Claim your username"
    >
      <label htmlFor="claim-username-input" className="sr-only">
        Claim your username handle
      </label>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-[24px] sm:rounded-full p-2 shadow-lg border border-forest/10 focus-within:ring-4 focus-within:ring-forest/20 transition-all gap-2">
        <div className="flex items-baseline flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-0 overflow-hidden">
          <span className="text-forest/70 font-semibold select-none whitespace-nowrap truncate max-w-[150px] sm:max-w-[200px] shrink text-sm sm:text-base leading-none">
            {siteConfig.reservedDomainPrefix}
          </span>
          <input
            id="claim-username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            className="flex-1 min-w-[80px] bg-transparent text-forest placeholder:text-forest/40 font-semibold text-sm sm:text-base outline-none leading-none ml-1"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-forest text-lime hover:bg-[#183d14] active:scale-[0.98] font-bold text-base px-6 py-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {isPending ? (
            <>
              <StarSpinner size={18} className="text-lime" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <span>Claim your link</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-xs sm:text-sm font-bold text-forest/80 px-2">
        Free to start. Sign in with Google in one click.
      </p>
    </form>
  );
}
