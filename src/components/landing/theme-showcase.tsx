export function ThemeShowcase() {
  const themes = [
    {
      name: "Avocado & Forest",
      tag: "Fresh & Energetic",
      phoneBg: "bg-lime text-forest border-forest",
      avatarBg: "bg-forest text-lime",
      initials: "MS",
      username: "@mateo_sound",
      role: "Music Producer & DJ",
      btnBg: "bg-forest text-lime",
      links: ["🎵 Latest EP on Spotify", "⚡ Tour Tickets 2026", "🎧 Sound Packs"],
    },
    {
      name: "Lilac & Maroon",
      tag: "Playful & Vibrant",
      phoneBg: "bg-lilac text-maroon border-maroon",
      avatarBg: "bg-maroon text-lilac",
      initials: "EB",
      username: "@emily_bakes",
      role: "Pastry Chef & Author",
      btnBg: "bg-maroon text-lilac",
      links: ["🍰 Weekend Pop-up Menu", "📖 Cookbook Pre-order", "💌 Recipe Club"],
    },
    {
      name: "Cobalt & White",
      tag: "Bold & Confident",
      phoneBg: "bg-cobalt text-white border-white/40",
      avatarBg: "bg-white text-cobalt",
      initials: "MK",
      username: "@marcus_builds",
      role: "Indie Software Maker",
      btnBg: "bg-white text-cobalt font-bold",
      links: ["🚀 ShipFast Framework", "💻 GitHub Repos", "🎙️ Podcast Ep #14"],
    },
    {
      name: "Mustard & Ink",
      tag: "Warm & Editorial",
      phoneBg: "bg-mustard text-ink border-ink",
      avatarBg: "bg-ink text-mustard",
      initials: "SZ",
      username: "@studio_z",
      role: "Ceramics & Goods",
      btnBg: "bg-ink text-cream",
      links: ["🏺 Summer Ceramic Drop", "🛒 Studio Catalog", "📍 Visit Our Store"],
    },
  ];

  return (
    <section
      id="themes"
      aria-label="Theme Customization Showcase"
      className="bg-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-ink/5"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-ink/5 text-ink text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <span>Styling &amp; Personalization</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-ink tracking-tight">
            Make it yours.
          </h2>
          <p className="mt-4 text-base sm:text-xl text-ink/70 font-medium">
            Express your unique vibe with curated solid-color themes that always stand out.
          </p>
        </div>

        {/* Scrollable container on mobile, grid on desktop */}
        <div className="flex overflow-x-auto pb-6 pt-2 px-2 gap-6 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          {themes.map((t) => (
            <div
              key={t.name}
              className="flex-none w-[260px] sm:w-auto snap-center flex flex-col items-center"
            >
              {/* CSS Phone mini mockup */}
              <div
                className={`w-full rounded-[36px] p-5 border-4 shadow-lg flex flex-col items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${t.phoneBg}`}
              >
                {/* Speaker pill */}
                <div className="w-14 h-2.5 bg-current opacity-20 rounded-full mb-4" />

                {/* Avatar */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-heading font-extrabold text-lg mb-2 shadow-sm ${t.avatarBg}`}
                >
                  {t.initials}
                </div>

                {/* Handle and role */}
                <h3 className="font-heading font-bold text-sm leading-tight text-center">
                  {t.username}
                </h3>
                <p className="text-[11px] font-medium opacity-80 mb-4 text-center">
                  {t.role}
                </p>

                {/* Mini link buttons */}
                <div className="w-full flex flex-col gap-2">
                  {t.links.map((linkText) => (
                    <div
                      key={linkText}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-center truncate shadow-xs ${t.btnBg}`}
                    >
                      {linkText}
                    </div>
                  ))}
                </div>

                {/* Mini brand tag */}
                <div className="mt-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  mylinks✦
                </div>
              </div>

              {/* Theme description tag */}
              <div className="mt-4 text-center">
                <p className="font-heading font-extrabold text-base text-ink">
                  {t.name}
                </p>
                <p className="text-xs font-semibold text-ink/60">
                  {t.tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
