"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkUsername, submitOnboarding } from "./actions";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { StarLoader, StarSpinner } from "@/components/brand/StarLoader";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { useSession } from "@/lib/auth-client";

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

  if (sessionLoading) {
    return <StarLoader variant="fullscreen" label="Checking your account..." />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="w-full max-w-md bg-white border-2 border-ink/10 rounded-[36px] p-8 sm:p-10 shadow-xl text-center">
      <div className="mx-auto w-16 h-16 bg-lime text-forest rounded-full flex items-center justify-center mb-6">
        <span className="font-heading font-extrabold text-2xl">@</span>
      </div>

      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight mb-2">
        Claim your link
      </h1>
      <p className="text-ink/70 font-medium mb-8">
        Choose a unique username for your page. You can change this later.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative text-left">
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <div
            className={`relative flex items-center w-full px-4 py-4 bg-cream border-2 rounded-2xl transition-all ${
              status === "invalid"
                ? "border-coral focus-within:ring-4 focus-within:ring-coral/20"
                : status === "valid"
                ? "border-forest focus-within:ring-4 focus-within:ring-forest/20"
                : "border-ink/10 focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10"
            }`}
          >
            <span className="font-bold text-ink/40 select-none shrink-0 whitespace-nowrap">
              {siteConfig.reservedDomainPrefix}
            </span>
            <input
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
              className="w-full bg-transparent font-bold text-ink placeholder:text-ink/30 outline-none border-none p-0 ml-1"
            />
            <div className="shrink-0 ml-2 flex items-center justify-center">
              {status === "loading" && <StarSpinner size={20} />}
              {status === "valid" && <CheckCircle2 className="w-5 h-5 text-forest" />}
              {status === "invalid" && <AlertCircle className="w-5 h-5 text-coral" />}
            </div>
          </div>

          {message && (
            <p
              className={`mt-2 text-sm font-bold pl-2 ${
                status === "invalid" ? "text-coral" : "text-forest"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="48px"
          disabled={status !== "valid" || isPending}
          loading={isPending}
          pendingText="Claiming..."
          className="mt-4 w-full text-lg"
        >
          Claim Username
        </Button>
      </form>
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

