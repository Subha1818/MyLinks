"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { siteConfig } from "@/lib/site";
import { ArrowLeft, Sparkles } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  return (
    <div className="w-full max-w-md bg-white border-2 border-ink/10 rounded-[36px] p-8 sm:p-10 shadow-xl text-center">
      <div className="flex justify-center mb-6">
        <Logo />
      </div>

      {username && (
        <div className="mb-6 inline-flex items-center gap-2 bg-lime/60 text-forest border border-forest/20 text-xs sm:text-sm font-bold px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-forest" />
          <span>Claiming handle: @{username}</span>
        </div>
      )}

      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
        Sign in coming soon
      </h1>

      <p className="mt-4 text-base text-ink/70 font-medium leading-relaxed">
        Google OAuth sign-in will be available in Phase 2. Your requested handle{" "}
        {username ? (
          <>
            <span className="font-bold text-forest">@{username}</span> is reserved
          </>
        ) : (
          "is reserved"
        )}{" "}
        and ready to be claimed.
      </p>

      <div className="mt-8 pt-6 border-t border-ink/10 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-ink text-cream hover:bg-black font-semibold text-base py-3.5 px-6 rounded-full transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {siteConfig.name}</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="font-heading font-bold text-lg text-ink">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
