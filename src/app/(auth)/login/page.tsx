"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { siteConfig } from "@/lib/site";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";

function LoginContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

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
        Welcome back
      </h1>

      <p className="mt-4 text-base text-ink/70 font-medium leading-relaxed mb-8">
        Sign in to manage your {siteConfig.name} profile and links.
      </p>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-3 bg-white text-ink border-2 border-ink hover:bg-cream font-bold text-lg py-4 px-6 rounded-full transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      <div className="mt-8 pt-6 border-t border-ink/10 flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 text-ink/60 hover:text-ink font-semibold text-sm transition-all"
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
