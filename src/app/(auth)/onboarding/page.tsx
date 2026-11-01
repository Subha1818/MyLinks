"use client";

import { useState, useEffect, useTransition, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checkUsername,
  submitOnboarding,
  suggestUsernames,
  getInitialSuggestions,
} from "./actions";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { StarLoader, StarSpinner } from "@/components/brand/StarLoader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { useSession } from "@/lib/auth-client";
import { ProfileView } from "@/components/profile/ProfileView";
import { THEME_PRESETS } from "@/lib/theme-presets";

type AvailabilityState = "idle" | "checking" | "available" | "taken" | "invalid" | "reserved";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialHandle = searchParams.get("username") || "";
  const { data: session, isPending: sessionLoading } = useSession();

  const [username, setUsername] = useState(initialHandle);
  const [debouncedUsername, setDebouncedUsername] = useState(initialHandle);
  const [status, setStatus] = useState<AvailabilityState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [takenAlternatives, setTakenAlternatives] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch initial name-derived suggestions once session loads
  useEffect(() => {
    if (!session?.user?.name) return;
    getInitialSuggestions().then((res) => {
      setNameSuggestions(res.suggestions || []);
    });
  }, [session?.user?.name]);

  // Debounce username input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(username), 350);
    return () => clearTimeout(timer);
  }, [username]);

  // Check username availability when debounced value updates
  useEffect(() => {
    if (!debouncedUsername) {
      const resetTimer = setTimeout(() => {
        setStatus("idle");
        setStatusMessage("");
        setTakenAlternatives([]);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    let isMounted = true;
    const startTimer = setTimeout(() => {
      if (isMounted) {
        setStatus("checking");
        setStatusMessage("Checking availability...");
      }
    }, 0);

    checkUsername(debouncedUsername).then((res) => {
      if (!isMounted) return;
      if (res.valid) {
        setStatus("available");
        setStatusMessage("Username is available!");
        setTakenAlternatives([]);
      } else {
        if (res.reason === "taken") {
          setStatus("taken");
          setStatusMessage("This username is already taken");
          suggestUsernames(debouncedUsername).then((sugRes) => {
            if (isMounted) setTakenAlternatives(sugRes.suggestions || []);
          });
        } else if (res.reason === "reserved") {
          setStatus("reserved");
          setStatusMessage("This username is reserved and cannot be used");
          setTakenAlternatives([]);
        } else {
          setStatus("invalid");
          setStatusMessage(res.message || "Username format is invalid");
          setTakenAlternatives([]);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(startTimer);
    };
  }, [debouncedUsername]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "available") return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", debouncedUsername);
      const res = await submitOnboarding(formData);
      if (res?.error) {
        setStatus("invalid");
        setStatusMessage(res.error);
      }
    });
  };

  if (sessionLoading) {
    return <StarLoader variant="fullscreen" label="Checking your account..." />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const sampleProfile = {
    displayName: session.user.name || "Your Name",
    bio: "Welcome to my link in bio • Built with MyLinks",
    avatarUrl: session.user.image || null,
    links: [
      { id: "1", title: "My Portfolio & Work", url: "https://example.com" },
      { id: "2", title: "Socials & Projects", url: "https://example.com" },
    ],
  };

  const hostDisplay = typeof window !== "undefined" ? window.location.host : "mylinkz.vercel.app";

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Mobile-only colored banner */}
      <div className="lg:hidden mb-4 bg-lime text-forest border border-forest/20 rounded-2xl p-4 text-center">
        <p className="font-heading font-black text-lg text-forest tracking-tight">
          Claim your link
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Bold Lime Panel with live preview phone (Desktop) */}
        <div
          aria-hidden="true"
          className="hidden lg:flex lg:col-span-7 bg-lime text-forest rounded-[32px] p-8 lg:p-10 border-2 border-forest/15 shadow-sm flex-col justify-between overflow-hidden relative select-none"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-forest text-lime text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview your link</span>
            </div>
            <h2 className="font-heading font-black text-3xl lg:text-4xl text-forest tracking-tight leading-[1.15] mb-3">
              Claim your link
            </h2>
            <p className="text-forest/85 font-medium text-base max-w-md">
              Your page URL will be{" "}
              <span className="font-bold underline decoration-forest/30">
                {hostDisplay}/{debouncedUsername || "yourname"}
              </span>
            </p>
          </div>

          {/* Decorative Phone Mockup showing chosen username & Google profile info */}
          <div className="mt-6 flex justify-center items-end">
            <div className="w-[300px] rounded-[36px] border-4 border-forest bg-white shadow-[6px_6px_0px_#1F4D1A] overflow-hidden p-2.5 transition-all duration-300">
              <div className="w-full h-[390px] rounded-[26px] overflow-hidden flex flex-col pointer-events-none">
                <ProfileView
                  displayName={sampleProfile.displayName}
                  bio={sampleProfile.bio}
                  avatarUrl={sampleProfile.avatarUrl}
                  links={sampleProfile.links}
                  theme={THEME_PRESETS[0].theme}
                  mode="preview"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Onboarding Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Card className="w-full p-8 sm:p-10 shadow-sm border border-hairline flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-lime text-forest rounded-full flex items-center justify-center mb-4 border border-forest/20 shadow-xs">
                <span className="font-heading font-black text-2xl">@</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                Claim your link
              </h1>
              <p className="mt-2 text-sm text-ink/70 font-medium">
                Pick something you&apos;ll love. Username changes aren&apos;t available yet.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative text-left">
                <label htmlFor="username" className="block text-xs font-bold text-ink/70 mb-1.5 pl-1">
                  Choose your username
                </label>

                {/* Username Input Container */}
                <div
                  className={`relative flex items-center w-full px-3.5 py-3.5 bg-cream border-2 rounded-2xl transition-all ${
                    status === "taken" || status === "invalid" || status === "reserved"
                      ? "border-tomato focus-within:ring-4 focus-within:ring-tomato/20"
                      : status === "available"
                      ? "border-forest focus-within:ring-4 focus-within:ring-forest/20"
                      : "border-hairline focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10"
                  }`}
                >
                  <span className="font-bold text-ink/40 select-none shrink-0 whitespace-nowrap text-xs sm:text-sm truncate max-w-[130px] sm:max-w-none">
                    {siteConfig.reservedDomainPrefix}
                  </span>
                  <input
                    ref={inputRef}
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                    }
                    placeholder="username"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    aria-describedby="availability-status"
                    className="w-full min-w-0 bg-transparent font-bold text-ink placeholder:text-ink/30 outline-none border-none p-0 ml-1 text-sm sm:text-base"
                  />
                  <div className="shrink-0 ml-2 flex items-center justify-center">
                    {status === "checking" && <StarSpinner size={18} />}
                    {status === "available" && <CheckCircle2 className="w-5 h-5 text-forest" />}
                    {(status === "taken" || status === "invalid" || status === "reserved") && (
                      <AlertCircle className="w-5 h-5 text-tomato" />
                    )}
                  </div>
                </div>

                {/* Status Announcement with Icon AND Text (aria-live="polite") */}
                <div
                  id="availability-status"
                  aria-live="polite"
                  className="min-h-[22px] mt-2 flex items-center gap-1.5 pl-1"
                >
                  {statusMessage && (
                    <p
                      className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                        status === "available"
                          ? "text-forest"
                          : status === "checking"
                          ? "text-ink/60"
                          : "text-tomato"
                      }`}
                    >
                      {status === "available" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      {(status === "taken" || status === "invalid" || status === "reserved") && (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{statusMessage}</span>
                    </p>
                  )}
                </div>

                {/* Suggestions when taken */}
                {status === "taken" && takenAlternatives.length > 0 && (
                  <div className="mt-3 p-3 bg-cream rounded-2xl border border-hairline">
                    <p className="text-xs font-bold text-ink/70 mb-2">Available suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {takenAlternatives.map((alt) => (
                        <button
                          key={alt}
                          type="button"
                          onClick={() => {
                            setUsername(alt);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1 bg-white hover:bg-lime text-forest border border-forest/20 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs"
                        >
                          <span>@{alt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Starting suggestions derived from Google Name when field is empty */}
                {!username && nameSuggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-cream rounded-2xl border border-hairline">
                    <p className="text-xs font-bold text-ink/70 mb-2">Suggested for you:</p>
                    <div className="flex flex-wrap gap-2">
                      {nameSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setUsername(sug);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1 bg-white hover:bg-lime text-forest border border-forest/20 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs"
                        >
                          <span>@{sug}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="48px"
                disabled={status !== "available" || isPending}
                loading={isPending}
                pendingText="Claiming..."
                className="mt-2 w-full text-base font-bold shadow-xs cursor-pointer"
              >
                Claim Username
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<StarLoader variant="fullscreen" label="Loading..." />}>
      <OnboardingContent />
    </Suspense>
  );
}
