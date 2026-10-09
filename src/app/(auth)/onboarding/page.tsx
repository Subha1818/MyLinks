"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkUsername, submitOnboarding } from "./actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(username), 500);
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
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ink/40" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
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
            <label htmlFor="username" className="sr-only">Username</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-ink/40 select-none">
                mylinks.com/
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                className={`w-full pl-[110px] pr-12 py-4 bg-cream border-2 rounded-2xl font-bold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-4 transition-all ${
                  status === "invalid" 
                    ? "border-coral focus:ring-coral/20" 
                    : status === "valid"
                      ? "border-forest focus:ring-forest/20"
                      : "border-ink/10 focus:border-ink focus:ring-ink/10"
                }`}
              />
              <div className="absolute right-4 flex items-center justify-center">
                {status === "loading" && <Loader2 className="w-5 h-5 animate-spin text-ink/40" />}
                {status === "valid" && <CheckCircle2 className="w-5 h-5 text-forest" />}
                {status === "invalid" && <AlertCircle className="w-5 h-5 text-coral" />}
              </div>
            </div>
            
            {message && (
              <p className={`mt-2 text-sm font-bold pl-2 ${
                status === "invalid" ? "text-coral" : "text-forest"
              }`}>
                {message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status !== "valid" || isPending}
            className="mt-4 w-full inline-flex items-center justify-center bg-ink text-cream hover:bg-black font-bold text-lg py-4 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Claim Username"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
