import {
  GripVertical,
  Palette,
  Sparkles,
  Eye,
  MousePointerClick,
  Share2,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section
      id="features"
      aria-label="Product Features"
      className="bg-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-hairline"
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
            A fast, honest toolkit to publish your links without bloat or paywalls.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Drag-and-drop links (Mint, spans 2 on lg) */}
          <div className="lg:col-span-2 bg-mint text-forest rounded-[28px] p-7 sm:p-9 border border-forest/15 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-6 shadow-2xs">
                <GripVertical className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest mb-2">
                Drag-and-drop link ordering
              </h3>
              <p className="text-forest/85 font-medium text-base sm:text-lg max-w-xl leading-relaxed">
                Add up to 50 links per page. Reorder them smoothly with touch
                and keyboard handles, and hide or show any link with a single tap.
              </p>
            </div>

            {/* CSS-built visual: Two reorderable link rows */}
            <div className="mt-8 pt-6 border-t border-forest/15 flex flex-col gap-2.5">
              <div className="bg-white/80 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-forest flex items-center justify-between border border-forest/10 shadow-xs">
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
                  <span className="truncate">🎨 New Art Prints &amp; Originals</span>
                </span>
                <span className="text-[11px] bg-forest text-lime px-2.5 py-0.5 rounded-full shrink-0">
                  Visible
                </span>
              </div>
              <div className="bg-white/50 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-forest flex items-center justify-between border border-forest/10">
                <span className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-forest/40 shrink-0" />
                  <span className="truncate">📓 Weekly Sketchbook Dispatch</span>
                </span>
                <span className="text-[11px] bg-forest/15 text-forest px-2.5 py-0.5 rounded-full shrink-0">
                  Visible
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Custom colors and fonts (Lilac) */}
          <div className="bg-lilac text-[#3B1A4A] rounded-[28px] p-7 sm:p-9 border border-[#3B1A4A]/15 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#3B1A4A]/10 text-[#3B1A4A] flex items-center justify-center mb-6 shadow-2xs">
                <Palette className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3B1A4A] mb-2">
                Your own colors &amp; fonts
              </h3>
              <p className="text-[#3B1A4A]/80 font-medium text-base leading-relaxed">
                Pick from 6 curated Google fonts and fine-tune text, button,
                and background colors with automatic WCAG contrast checks.
              </p>
            </div>

            {/* CSS-built visual: Typography and palette sample chips */}
            <div className="mt-8 pt-6 border-t border-[#3B1A4A]/15 flex flex-wrap gap-2">
              <span className="bg-white/80 text-[#3B1A4A] px-3 py-1 rounded-full text-xs font-bold border border-[#3B1A4A]/10 font-heading">
                Bricolage
              </span>
              <span className="bg-white/80 text-[#3B1A4A] px-3 py-1 rounded-full text-xs font-bold border border-[#3B1A4A]/10">
                DM Sans
              </span>
              <span className="bg-white/80 text-[#3B1A4A] px-3 py-1 rounded-full text-xs font-serif font-bold border border-[#3B1A4A]/10">
                Fraunces
              </span>
              <span className="bg-white/80 text-[#3B1A4A] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#3B1A4A]/10">
                DM Mono
              </span>
            </div>
          </div>

          {/* Card 3: Backgrounds and patterns (Cobalt) */}
          <div className="bg-cobalt text-white rounded-[28px] p-7 sm:p-9 border border-white/20 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 text-white flex items-center justify-center mb-6 shadow-2xs">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-2">
                Backgrounds &amp; patterns
              </h3>
              <p className="text-white/85 font-medium text-base leading-relaxed">
                Add polka dots, stripes, checks, or smooth directional gradients
                built strictly with CSS — zero heavy image downloads.
              </p>
            </div>

            {/* CSS-built visual: Pattern swatches */}
            <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-2">
              <div
                className="h-12 rounded-xl border border-white/30"
                style={{
                  backgroundColor: "#1D4ED8",
                  backgroundImage: "radial-gradient(#FFFFFF 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
                title="Dots pattern"
              />
              <div
                className="h-12 rounded-xl border border-white/30"
                style={{
                  backgroundColor: "#1D4ED8",
                  backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)",
                  backgroundSize: "14px 14px",
                }}
                title="Stripes pattern"
              />
              <div
                className="h-12 rounded-xl border border-white/30"
                style={{
                  backgroundImage: "linear-gradient(135deg, #2563D9, #7A0A1E)",
                }}
                title="Gradient fill"
              />
            </div>
          </div>

          {/* Card 4: Live preview while you edit (White) */}
          <div className="bg-white text-ink rounded-[28px] p-7 sm:p-9 border border-hairline flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-ink/5 text-ink flex items-center justify-center mb-6 shadow-2xs">
                <Eye className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
                Live preview while you edit
              </h3>
              <p className="text-ink/75 font-medium text-base leading-relaxed">
                Watch every profile change, link addition, and theme tweak appear
                instantaneously in an interactive phone preview.
              </p>
            </div>

            {/* CSS visual: Mini phone silhouette */}
            <div className="mt-8 pt-6 border-t border-hairline flex items-center justify-center">
              <div className="w-36 h-20 rounded-2xl bg-cream border border-hairline flex flex-col items-center justify-center p-2.5 gap-1.5 shadow-inner">
                <div className="w-8 h-1 bg-ink/20 rounded-full mb-1" />
                <div className="w-20 h-2 bg-lime rounded-full" />
                <div className="w-16 h-2 bg-ink/15 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 5: Click counts per link (Lime) */}
          <div className="bg-lime text-forest rounded-[28px] p-7 sm:p-9 border border-forest/15 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-6 shadow-2xs">
                <MousePointerClick className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest mb-2">
                Click counts per link
              </h3>
              <p className="text-forest/85 font-medium text-base leading-relaxed">
                Know which links perform best with lightweight, per-link click
                counters recorded without cookies or IP addresses.
              </p>
            </div>

            {/* CSS-built visual: Link row with click badge */}
            <div className="mt-8 pt-6 border-t border-forest/15">
              <div className="bg-white rounded-2xl p-3 border border-forest/15 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-bold text-forest truncate mr-2">
                  🎨 Art Prints Drop
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-lime bg-forest px-2.5 py-0.5 rounded-full shrink-0">
                  <MousePointerClick className="w-3 h-3" />
                  <span>142 clicks</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: Rich preview cards when shared (Mustard, spans 3 on lg or 1) */}
          <div className="lg:col-span-3 bg-mustard text-[#2A1B00] rounded-[28px] p-7 sm:p-9 border border-[#2A1B00]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2A1B00]/10 text-[#2A1B00] flex items-center justify-center shrink-0 shadow-2xs">
                <Share2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2A1B00] mb-1">
                  Looks great when shared
                </h3>
                <p className="text-[#2A1B00]/80 font-medium text-base sm:text-lg max-w-2xl leading-relaxed">
                  Every public profile features automatically generated Open Graph
                  and Twitter cards, so your links look bold and polished in
                  WhatsApp, Instagram, and X chats.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center text-xs font-bold bg-[#2A1B00] text-mustard px-4 py-2 rounded-full uppercase tracking-wider shadow-xs">
                Rich Social Cards
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
