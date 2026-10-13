"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkUsername, submitOnboarding } from "./actions";
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight, LogOut } from "lucide-react";
import { StarLoader, StarSpinner } from "@/components/brand/StarLoader";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { siteConfig } from "@/lib/site";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialHandle = searchParams.get("username") || "";
  const { data: session, isPending: sessionLoading } = useSession();

  const [username, setUsername] = useState(initialHandle);
  const [debouncedUsername, setDebouncedUsername] = useState(initialHandle);
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(username), 400);
    return () => clearTimeout(timer);
  }, [username]);

  // Check username when debounced value changes
  useEffect(() => {
    if (!debouncedUsername) {
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 0);
      return;
    }

    let isMounted = true;
    setTimeout(() => {
      if (isMounted) setStatus("loading");
    }, 0);

    checkUsername(debouncedUsername).then((res) => {
      if (!isMounted) return;
      if (res.valid) {
        setStatus("valid");
        setMessage("Username is available!");
      } else {
        setStatus("invalid");
        setMessage(res.message || "Username is invalid");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedUsername]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "valid") return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", debouncedUsername);
      const res = await submitOnboarding(formData);
      if (res?.error) {
        setStatus("invalid");
        setMessage(res.error);
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (sessionLoading) {
    return <StarLoader variant="fullscreen" label="Checking your account..." />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden select-none">
      {/* Decorative Brand Accent Circles */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-lime/30 blur-2xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-mint/40 blur-2xl pointer-events-none"
      />

      {/* Top Brand Logo */}
      <div className="mb-6 z-10 flex flex-col items-center">
        <Logo />
      </div>

      {/* Main Card with Signature Offset Shadow */}
      <div className="relative w-full max-w-lg z-10">
        {/* Layer 0: Flat Forest Offset Background Card */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-forest rounded-[36px] translate-x-2.5 translate-y-2.5 border-2 border-forest/20 shadow-xl pointer-events-none"
        />

        {/* Layer 1: Foreground Card */}
        <div className="relative bg-white border-2 border-ink rounded-[36px] p-6 sm:p-9 shadow-lg text-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 bg-lime text-forest border border-forest/20 text-xs font-extrabold px-3.5 py-1 rounded-full mb-4 uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Claim your handle</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight mb-2">
            Claim your link
          </h1>
          <p className="text-ink/70 font-medium text-sm sm:text-base mb-4 leading-relaxed max-w-sm mx-auto">
            Choose a unique username for your page. You can change this later in settings.
          </p>

          {/* User Profile Pill */}
          {session?.user && (
            <div className="mb-6 inline-flex items-center gap-2.5 bg-cream px-3 py-1.5 rounded-full border border-hairline text-xs font-semibold text-ink/75 max-w-full truncate">
              <Avatar
                src={session.user.image}
                fallback={session.user.name || "User"}
                size="sm"
              />
              <span className="truncate">
                Signed in as <strong className="text-ink">{session.user.name || session.user.email}</strong>
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-2">
                Your Public URL
              </label>

              {/* Flexbox Input Bar: Prefix and input sit side-by-side with zero overlap */}
              <div
                className={cn(
                  "flex items-center w-full px-4 py-3 bg-cream border-2 rounded-2xl transition-all",
                  status === "invalid"
                    ? "border-coral focus-within:ring-4 focus-within:ring-coral/20"
                    : status === "valid"
                    ? "border-forest focus-within:ring-4 focus-within:ring-forest/20"
                    : "border-hairline focus-within:border-forest focus-within:ring-4 focus-within:ring-forest/15"
                )}
              >
                {/* Domain prefix (e.g. mylinkz.vercel.app/) */}
                <span className="font-heading font-bold text-ink/50 select-none whitespace-nowrap shrink-0 text-sm sm:text-base">
                  {siteConfig.reservedDomainPrefix}
                </span>

                {/* Input field starts immediately after the prefix */}
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  placeholder="yourname"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  maxLength={30}
                  className="w-full bg-transparent font-heading font-bold text-ink placeholder:text-ink/30 outline-none border-none p-0 ml-1 text-sm sm:text-base"
                />

                {/* Validation Status Icon */}
                <div className="shrink-0 ml-2 flex items-center justify-center min-w-[20px]">
                  {status === "loading" && <StarSpinner size={18} className="text-forest" />}
                  {status === "valid" && <CheckCircle2 className="w-5 h-5 text-forest stroke-[2.5]" />}
                  {status === "invalid" && <AlertCircle className="w-5 h-5 text-coral stroke-[2.5]" />}
                </div>
              </div>

              {/* Status Message or Guidelines */}
              <div className="mt-2 min-h-[20px] px-1">
                {message ? (
                  <p
                    className={cn(
                      "text-xs font-bold flex items-center gap-1",
                      status === "invalid" ? "text-coral" : "text-forest"
                    )}
                  >
                    <span>{status === "valid" ? "✓" : "!"}</span>
                    <span>{message}</span>
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-ink/50">
                    Use letters, numbers, hyphens, or underscores (3–30 characters).
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              variant={status === "valid" ? "accent" : "primary"}
              size="48px"
              disabled={status !== "valid" || isPending}
              loading={isPending}
              pendingText="Claiming your handle..."
              className={cn(
                "w-full text-base font-extrabold shadow-sm gap-2 transition-all cursor-pointer mt-1",
                status === "valid" && "hover:shadow-md active:scale-[0.99]"
              )}
            >
              <span>Claim handle</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-ink/60">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 hover:text-tomato transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
            <Link href="/" className="hover:text-forest transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<StarLoader variant="fullscreen" label="Loading..." />}>
      <OnboardingContent />
    </Suspense>
  );
}

