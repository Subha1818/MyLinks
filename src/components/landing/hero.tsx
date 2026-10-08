import { siteConfig } from "@/lib/site";
import { ClaimForm } from "@/components/landing/claim-form";
import { HeroMockup } from "@/components/landing/hero-mockup";

export function Hero() {
  return (
    <section
      aria-label="Hero Section"
      className="bg-lime text-forest pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Playful badge */}
            <div className="inline-flex items-center gap-2 self-start bg-forest text-lime text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-sm">
              <span>✦</span>
              <span>The Next-Gen Link in Bio</span>
            </div>

            {/* Massive Heading */}
            <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-forest">
              A link in bio built for you.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 text-lg sm:text-xl text-forest/90 font-medium max-w-xl leading-relaxed">
              Join thousands of creators using {siteConfig.name} to share everything they make, curate, and love — in one clean, lightning-fast link.
            </p>

            {/* Claim Handle Form */}
            <ClaimForm />
          </div>

          {/* Right Hero Column: CSS Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end pt-6 lg:pt-0">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
