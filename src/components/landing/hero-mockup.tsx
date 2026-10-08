import { ExternalLink, Sparkles } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function HeroMockup() {
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px] mx-auto select-none">
      {/* Flat offset card behind the phone */}
      <div
        className="absolute inset-0 bg-cobalt rounded-[44px] -rotate-3 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 shadow-xl border-4 border-ink"
        aria-hidden="true"
      />

      {/* Main phone body */}
      <div className="relative bg-white text-ink rounded-[40px] p-5 sm:p-6 shadow-2xl border-4 border-ink rotate-2 hover:rotate-0 transition-transform duration-300">
        {/* Phone speaker notch */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-4 bg-ink/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-1.5 bg-ink/20 rounded-full" />
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with initials */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-lilac border-3 border-ink flex items-center justify-center font-heading font-extrabold text-2xl text-maroon shadow-sm">
              AR
            </div>
            <div className="absolute -bottom-1 -right-1 bg-lime text-forest border-2 border-ink rounded-full p-1">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="font-heading font-extrabold text-xl text-ink tracking-tight">
            Alex Rivera
          </h3>
          <p className="text-xs font-semibold text-ink/60 mt-0.5">
            @alexrivera
          </p>
          <p className="text-xs text-ink/80 mt-2 font-medium max-w-[240px] leading-relaxed">
            Visual designer &amp; creative director. Sharing fresh tools, templates, and weekly design drops.
          </p>

          {/* Social icons row */}
          <div className="flex items-center gap-3 mt-4 mb-5">
            <span
              className="w-8 h-8 rounded-full bg-cream border border-ink/20 flex items-center justify-center text-ink hover:scale-105 transition-transform"
              title="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </span>
            <span
              className="w-8 h-8 rounded-full bg-cream border border-ink/20 flex items-center justify-center text-ink hover:scale-105 transition-transform"
              title="Twitter"
            >
              <TwitterIcon className="w-3.5 h-3.5" />
            </span>
            <span
              className="w-8 h-8 rounded-full bg-cream border border-ink/20 flex items-center justify-center text-ink hover:scale-105 transition-transform"
              title="YouTube"
            >
              <YoutubeIcon className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 4 Stacked rounded link buttons */}
        <div className="flex flex-col gap-2.5">
          <div className="w-full bg-lime text-forest border-2 border-forest/20 rounded-2xl p-3 flex items-center justify-between font-bold text-xs sm:text-sm hover:translate-x-0.5 transition-transform">
            <span>✨ Spring Design System Kit</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </div>

          <div className="w-full bg-cream text-ink border-2 border-ink/15 rounded-2xl p-3 flex items-center justify-between font-bold text-xs sm:text-sm hover:translate-x-0.5 transition-transform">
            <span>🎨 Portfolio &amp; Case Studies</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </div>

          <div className="w-full bg-cream text-ink border-2 border-ink/15 rounded-2xl p-3 flex items-center justify-between font-bold text-xs sm:text-sm hover:translate-x-0.5 transition-transform">
            <span>☕ Book a 1:1 Mentorship Call</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </div>

          <div className="w-full bg-cream text-ink border-2 border-ink/15 rounded-2xl p-3 flex items-center justify-between font-bold text-xs sm:text-sm hover:translate-x-0.5 transition-transform">
            <span>💌 Read Design Dispatch #42</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </div>
        </div>

        {/* Phone footer brand tag */}
        <div className="mt-5 pt-3 border-t border-ink/10 flex items-center justify-center gap-1.5 text-[11px] font-bold text-ink/40 tracking-wider uppercase">
          <span>MyLinks</span>
          <span>✦</span>
        </div>
      </div>
    </div>
  );
}
