export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Sign in with Google",
      desc: "One-click authentication. No passwords to invent, lose, or reset.",
    },
    {
      num: "02",
      title: "Pick your username",
      desc: "Claim your handle and personalize your display name and bio.",
    },
    {
      num: "03",
      title: "Add your links and share",
      desc: "Add up to 50 links, choose your favorite theme, and share your public link everywhere.",
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className="bg-forest text-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 text-lime text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <span>3 Simple Steps</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-cream tracking-tight">
            How it works
          </h2>
          <p className="mt-4 text-base sm:text-xl text-cream/80 font-medium">
            From sign-in to a live link-in-bio in under a minute.
          </p>
        </div>

        {/* 3 Steps Grid with Big Numerals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white/5 border border-white/15 rounded-[28px] p-8 sm:p-10 flex flex-col justify-between hover:bg-white/10 transition-all duration-150"
            >
              <div>
                <div className="font-heading font-extrabold text-6xl sm:text-7xl text-lime leading-none mb-6">
                  {step.num}
                </div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-cream mb-3">
                  {step.title}
                </h3>
                <p className="text-cream/80 font-medium text-base sm:text-lg leading-relaxed">
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
