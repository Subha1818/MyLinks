import { ClaimForm } from "@/components/landing/claim-form";
import { Sparkles } from "lucide-react";

export function FinalCta() {
  return (
    <section
      aria-label="Call to Action"
      className="bg-mustard text-ink py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-hairline"
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-ink text-mustard text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Claim Your Handle</span>
        </div>

        <h2 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-ink leading-[0.95]">
          Claim your link today.
        </h2>

        <p className="mt-6 text-lg sm:text-2xl text-ink/80 font-medium max-w-2xl mx-auto leading-relaxed">
          Create your personalized page in seconds. Free to start, with zero
          passwords to remember.
        </p>

        {/* Claim Handle Input Form */}
        <div className="w-full flex justify-center">
          <ClaimForm />
        </div>
      </div>
    </section>
  );
}
