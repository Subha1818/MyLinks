"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { siteConfig } from "@/lib/site";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { StarSpinner } from "@/components/brand/StarLoader";
import { signIn } from "@/lib/auth-client";
import { validateUsernameFormat } from "@/lib/validators/username";
import { Card } from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawUsername = searchParams.get("username");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const errorAlertRef = useRef<HTMLDivElement>(null);

  // Validate passed username
  const validUsername = useMemo(() => {
    if (!rawUsername) return null;
    const res = validateUsernameFormat(rawUsername);
    return res.valid ? res.username : null;
  }, [rawUsername]);

  // Focus error alert on mount if error is present
  useEffect(() => {
    if (errorParam && !errorDismissed) {
      errorAlertRef.current?.focus();
    }
  }, [errorParam, errorDismissed]);

  const friendlyErrorMessage = useMemo(() => {
    if (!errorParam || errorDismissed) return null;
    const lower = errorParam.toLowerCase();
    if (
      lower.includes("access_denied") ||
      lower.includes("denied") ||
      lower.includes("cancelled") ||
      lower.includes("canceled")
    ) {
      return "Sign in was cancelled or permission was denied. Try again when you're ready.";
    }
    if (lower.includes("expired") || lower.includes("timeout") || lower.includes("session")) {
      return "Your sign-in link expired. Please try again.";
    }
    return "We couldn't complete your sign in. Please try again.";
  }, [errorParam, errorDismissed]);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorDismissed(true);

    try {
      const destination = validUsername
        ? `/onboarding?username=${encodeURIComponent(validUsername)}`
        : callbackUrl;

      await signIn.social({
        provider: "google",
        callbackURL: destination,
      });
    } catch (err) {
      console.error("[Login] OAuth request error:", err);
      setIsLoading(false);
    }
  };

  const hostDisplay = typeof window !== "undefined" ? window.location.host : "mylinkz.vercel.app";

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full p-8 sm:p-10 shadow-sm border border-hairline flex flex-col justify-center text-center">
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label={`${siteConfig.name} Home`}>
            <Logo />
          </Link>
        </div>

        {validUsername && (
          <div className="mb-6 inline-flex items-center justify-center gap-2 bg-lime/60 text-forest border border-forest/20 text-xs sm:text-sm font-bold px-4 py-2 rounded-full mx-auto max-w-full truncate">
            <Sparkles className="w-4 h-4 shrink-0 text-forest" />
            <span className="truncate">
              Claiming {hostDisplay}/{validUsername}
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink/70 font-medium">
            Sign in to manage your link in bio.
          </p>
        </div>

        {/* Accessible OAuth Error Alert */}
        {friendlyErrorMessage && (
          <div
            ref={errorAlertRef}
            tabIndex={-1}
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 rounded-2xl bg-tomato/10 border border-tomato/20 text-tomato flex flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-tomato text-left"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug">{friendlyErrorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorDismissed(true)}
              className="self-end inline-flex items-center gap-1.5 text-xs font-bold text-tomato hover:underline cursor-pointer pt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        {/* Continue with Google Pill Button with Google icon */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-3 bg-white text-ink border-2 border-ink hover:bg-cream font-bold text-base sm:text-lg py-3.5 px-6 rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-70 disabled:cursor-not-allowed select-none"
        >
          {isLoading ? (
            <>
              <StarSpinner className="w-5 h-5 text-forest shrink-0" />
              <span>Opening Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Small Print with links to Terms and Privacy */}
        <p className="mt-6 text-xs text-ink/50 text-center leading-relaxed">
          By continuing you agree to the{" "}
          <Link href="/terms" className="underline hover:text-ink font-semibold">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-ink font-semibold">
            Privacy Policy
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
