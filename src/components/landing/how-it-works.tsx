export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Sign in with Google",
      desc: "Instant one-tap login. No passwords to remember, no slow email verification links.",
    },
    {
      num: "02",
      title: "Pick your username",
      desc: "Lock in your clean handle at mylinks.to/yourname and personalize your profile.",
    },
    {
      num: "03",
      title: "Add your links & share",
      desc: "Drop your music, videos, store, or newsletter, and put your link in your social bio.",
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className="bg-cobalt text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-white/15 text-lime text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <span>3 Simple Steps</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
            How it works
          </h2>
          <p className="mt-4 text-base sm:text-xl text-white/80 font-medium">
            From zero to a published link-in-bio in less than a minute.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white/10 border-2 border-white/20 rounded-[36px] p-8 sm:p-10 flex flex-col justify-between hover:bg-white/15 transition-all duration-200"
            >
              <div>
                <div className="font-heading font-extrabold text-6xl sm:text-7xl text-lime leading-none mb-6">
                  {step.num}
                </div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/80 font-medium text-base sm:text-lg leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime">
                <span>Fast &amp; effortless</span>
                <span>✦</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
