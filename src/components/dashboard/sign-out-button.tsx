"use client";

import { useState, useEffect } from "react";
import { LogOut, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { signOut, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="inline-flex items-center justify-center gap-2 bg-cream hover:bg-ink/5 text-ink border border-ink/20 font-bold text-sm py-2.5 px-5 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSigningOut ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
    </button>
  );
}

export function SignOutAllButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading]);

  const handleRevokeAll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Revoke all user sessions on the server
      const res = await authClient.revokeSessions();
      if (res?.error) {
        throw new Error(res.error.message || "Failed to revoke sessions");
      }

      // 2. Clear current session cookie
      await signOut();

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 700);
    } catch (err: unknown) {
      console.error("Revoke sessions error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign out of all devices. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setIsSuccess(false);
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 bg-coral hover:bg-coral/90 text-white font-bold text-sm py-2.5 px-5 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        <ShieldAlert className="w-4 h-4" />
        <span>Sign out of all devices</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white border-2 border-ink/10 rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
            <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mb-5">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 id="revoke-modal-title" className="font-heading font-extrabold text-xl text-ink">
              Sign out of all devices?
            </h3>

            <p className="mt-2 text-sm text-ink/70 font-medium leading-relaxed">
              This will revoke all active sessions across all your browsers and devices. You will immediately be signed out everywhere and will need to log in again.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-xs font-bold">
                {error}
              </div>
            )}

            {isSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>All devices signed out! Redirecting to login...</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-full border border-ink/20 text-ink hover:bg-cream font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={handleRevokeAll}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-coral hover:bg-coral/90 text-white font-bold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Confirm & Sign out all</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
