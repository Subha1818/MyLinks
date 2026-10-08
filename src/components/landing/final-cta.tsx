import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCta() {
  return (
    <section
      aria-label="Call to Action"
      className="bg-mustard text-ink py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-ink text-mustard text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get Your Unique Handle</span>
        </div>

        <h2 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-ink leading-[0.95] max-w-4xl mx-auto">
          Claim your link today.
        </h2>

        <p className="mt-6 text-lg sm:text-2xl text-ink/80 font-medium max-w-2xl mx-auto">
          Join creators and curators worldwide. Set up your {siteConfig.name} profile in less than two minutes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ink text-cream hover:bg-black font-heading font-extrabold text-lg px-9 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span>Get started free</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>

        <p className="mt-4 text-xs sm:text-sm font-semibold text-ink/70">
          No credit card required. Free tier forever.
        </p>
      </div>
    </section>
  );
}
