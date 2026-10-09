import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-heading font-black text-ink tracking-tight">
            404
          </h1>
          <h2 className="text-2xl font-heading font-bold text-ink">
            This page doesn&apos;t exist
          </h2>
          <p className="text-ink/60 font-medium">
            The profile you&apos;re looking for couldn&apos;t be found. It might have been
            deleted, or the username is available!
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <Link
            href="/login"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-coral hover:bg-coral/90 text-cream font-bold py-4 px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-coral/20"
          >
            Claim your link
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-ink/70 hover:text-ink font-bold py-3 px-6 rounded-full transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to {siteConfig.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
