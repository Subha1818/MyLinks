import {
  Link2,
  Palette,
  Zap,
  BarChart3,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section
      id="features"
      aria-label="Product Features"
      className="bg-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-ink/5 text-ink text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <span>Features</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-ink tracking-tight">
            Everything you need. Nothing you don’t.
          </h2>
          <p className="mt-4 text-base sm:text-xl text-ink/70 font-medium">
            Designed to get you up and running in under 60 seconds with zero friction.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Custom themes (Spans 2 cols on lg) - Lilac */}
          <div className="lg:col-span-2 bg-lilac text-maroon rounded-[36px] p-8 sm:p-10 border-2 border-maroon/10 flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-maroon text-lilac flex items-center justify-center mb-6 shadow-sm">
                <Palette className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-maroon mb-2">
                Custom themes &amp; solid color palettes
              </h3>
              <p className="text-maroon/80 font-medium text-base sm:text-lg max-w-xl">
                Choose from hand-curated high-contrast color sets or tune buttons, fonts, and accents to match your identity.
              </p>
            </div>

            {/* Mini visual: Theme-swatch row */}
            <div className="mt-8 pt-6 border-t border-maroon/15 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-maroon/70 uppercase tracking-wider mr-2">
                Palette presets:
              </span>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-lime border-2 border-forest shadow-sm" title="Lime & Forest" />
                <span className="w-8 h-8 rounded-full bg-cobalt border-2 border-white shadow-sm" title="Cobalt" />
                <span className="w-8 h-8 rounded-full bg-mustard border-2 border-ink shadow-sm" title="Mustard" />
                <span className="w-8 h-8 rounded-full bg-maroon border-2 border-lilac shadow-sm" title="Maroon" />
                <span className="w-8 h-8 rounded-full bg-white border-2 border-ink shadow-sm" title="Clean Minimal" />
              </div>
            </div>
          </div>

          {/* Card 2: Unlimited links - White */}
          <div className="bg-white text-ink rounded-[36px] p-8 sm:p-10 border-2 border-ink/10 flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-ink text-cream flex items-center justify-center mb-6 shadow-sm">
                <Link2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
                Unlimited links
              </h3>
              <p className="text-ink/75 font-medium text-base">
                Add as many links as you want and reorder them seamlessly with drag-and-drop.
              </p>
            </div>

            {/* Mini visual: Link button stack */}
            <div className="mt-8 flex flex-col gap-2 pt-4">
              <div className="bg-cream rounded-xl px-4 py-2 text-xs font-bold text-ink border border-ink/10 flex items-center justify-between">
                <span>🎵 Latest single on Spotify</span>
                <span className="text-[10px] bg-ink/10 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <div className="bg-cream rounded-xl px-4 py-2 text-xs font-bold text-ink border border-ink/10 flex items-center justify-between">
                <span>⚡ New YouTube Vlog</span>
                <span className="text-[10px] bg-ink/10 px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>
          </div>

          {/* Card 3: Instant public page - Cobalt */}
          <div className="bg-cobalt text-white rounded-[36px] p-8 sm:p-10 border-2 border-cobalt flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white text-cobalt flex items-center justify-center mb-6 shadow-sm">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-2">
                Instant public page
              </h3>
              <p className="text-white/85 font-medium text-base">
                Server-rendered profile loaded in milliseconds with rich Open Graph social previews.
              </p>
            </div>

            <div className="mt-8 pt-4">
              <div className="bg-white/15 backdrop-blur-none border border-white/30 rounded-2xl p-3 text-center">
                <span className="text-xs font-mono font-bold tracking-tight text-white">
                  mylinks.to/@yourname 🚀
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Click tracking - Mustard */}
          <div className="bg-mustard text-ink rounded-[36px] p-8 sm:p-10 border-2 border-ink/10 flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-ink text-mustard flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
                Click tracking
              </h3>
              <p className="text-ink/80 font-medium text-base">
                Know which links your audience loves most without intrusive surveillance trackers.
              </p>
            </div>

            {/* Mini visual: Click counter badge */}
            <div className="mt-8 pt-4">
              <div className="bg-white rounded-2xl p-3 border border-ink/10 flex items-center justify-between shadow-sm">
                <span className="text-xs font-bold text-ink/70">Total Clicks</span>
                <span className="text-sm font-extrabold text-forest bg-lime px-2 py-0.5 rounded-full">
                  +3,420
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Mobile-first & fast (Spans 2 cols on lg) - Lime */}
          <div className="lg:col-span-2 bg-lime text-forest rounded-[36px] p-8 sm:p-10 border-2 border-forest/15 flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center mb-6 shadow-sm">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest mb-2">
                Engineered for mobile visitors
              </h3>
              <p className="text-forest/85 font-medium text-base sm:text-lg max-w-xl">
                90% of your audience clicks from Instagram, TikTok, or WhatsApp. MyLinks loads instantly with touch-friendly tap targets.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-forest/15 flex flex-wrap items-center gap-6 text-sm font-bold text-forest">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-forest" />
                Zero bloat
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-forest" />
                Accessible contrast
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-forest" />
                Sub-second page load
              </span>
            </div>
          </div>

          {/* Card 6: Free to start - White (Spans 3 cols or fits clean) */}
          <div className="lg:col-span-3 bg-white text-ink rounded-[36px] p-8 sm:p-10 border-2 border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:-translate-y-0.5 transition-transform">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-ink">
                  Free to start, no credit card required
                </h3>
                <p className="text-ink/70 font-medium text-base mt-1">
                  Claim your unique handle today and build your link in bio without paywalls.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center text-forest bg-lime px-4 py-2 rounded-full font-heading font-extrabold text-sm uppercase tracking-wider">
                100% Free Tier
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
