"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export function ClaimForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanUsername) {
      router.push(`/login?username=${encodeURIComponent(cleanUsername)}`);
    } else {
      router.push(`/login`);
    }
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-3xl sm:rounded-full p-2 shadow-lg border border-forest/10 focus-within:ring-4 focus-within:ring-forest/20 transition-all gap-2">
        <div className="flex items-center flex-1 px-3 sm:px-4 py-2 sm:py-0">
          <span className="text-forest/70 font-semibold select-none text-base sm:text-lg">
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
            className="w-full bg-transparent text-forest placeholder:text-forest/40 font-semibold text-base sm:text-lg outline-none ml-0.5"
          />
        </div>

        <button
          type="submit"
          className="bg-forest text-lime hover:bg-[#163812] active:scale-[0.98] font-bold text-base px-6 py-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          <span>Claim your link</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <p className="mt-3 text-xs sm:text-sm font-medium text-forest/80 px-2">
        It’s free, fast, and takes less than a minute to claim.
      </p>
    </form>
  );
}
