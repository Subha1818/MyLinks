"use client";

import { useEffect, useRef, useState } from "react";
import { Check, GripVertical, Copy } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-scroll-progress";

interface StepData {
  num: string;
  title: string;
  desc: string;
  color: string;
}

const STEPS: StepData[] = [
  {
    num: "01",
    title: "Sign in with Google",
    desc: "One click with your Google account. No passwords to invent, lose, or reset.",
    color: "#D4E83A", // Lime
  },
  {
    num: "02",
    title: "Pick your username",
    desc: "Claim your unique link at mylinks.com/yourname with instant availability feedback.",
    color: "#EBC4EE", // Lilac
  },
  {
    num: "03",
    title: "Add your links and share",
    desc: "Add up to 50 links, arrange them with drag and drop, and drop your public link in your bio.",
    color: "#E0A92E", // Mustard
  },
];

/* Scene 1: Sign in with Google */
function SceneOne({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 text-ink select-none">
      {/* Mock Account Chip */}
      <div className="w-full bg-white rounded-2xl border-2 border-ink p-4 shadow-[4px_4px_0px_#14181F] flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-forest text-lime font-heading font-extrabold text-xl flex items-center justify-center shrink-0 border border-ink">
          A
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading font-extrabold text-base text-ink truncate">Alex Rivera</div>
          <div className="text-xs font-medium text-ink/65 truncate">alex.rivera@example.com</div>
        </div>
      </div>

      {/* Pill Button: Continue with Google (No Google logo/branding) */}
      <div className="w-full relative">
        <div className="w-full bg-ink text-white font-heading font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-full text-center shadow-[4px_4px_0px_#14181F] flex items-center justify-center gap-2">
          <span>Continue with Google</span>
        </div>

        {/* Check Mark Pops In */}
        <div
          className={`absolute -bottom-3 -right-2 bg-mint border-2 border-ink text-forest text-xs font-extrabold px-3 py-1 rounded-full shadow-[2px_2px_0px_#14181F] flex items-center gap-1.5 ${
            reducedMotion ? "opacity-100" : "animate-pop-in [animation-delay:400ms]"
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3] text-forest" />
          <span>Signed in</span>
        </div>
      </div>
    </div>
  );
}

/* Scene 2: Pick your username */
function SceneTwo({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-3 select-none">
      <div className="w-full bg-white rounded-3xl border-2 border-ink p-5 shadow-[4px_4px_0px_#14181F] flex flex-col gap-3">
        <div className="text-xs font-extrabold uppercase tracking-wider text-ink/60">
          Claim your handle
        </div>

        {/* Input box with prefix */}
        <div className="flex items-center bg-cream/70 border-2 border-ink rounded-xl px-3 py-2.5 font-mono text-sm sm:text-base">
          <span className="text-ink/50 select-none">mylinks.com/</span>
          {reducedMotion ? (
            <span className="font-extrabold text-ink">alex</span>
          ) : (
            <span className="animate-typing-alex font-extrabold text-ink inline-block">alex</span>
          )}
          {!reducedMotion && <span className="w-0.5 h-5 bg-ink inline-block ml-0.5 animate-pulse" />}
        </div>

        {/* Available Badge Pops In */}
        <div
          className={`inline-flex items-center self-start gap-1.5 bg-mint border-2 border-ink text-forest text-xs font-extrabold px-3 py-1 rounded-full shadow-[2px_2px_0px_#14181F] ${
            reducedMotion ? "opacity-100" : "animate-pop-in [animation-delay:650ms]"
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>mylinks.com/alex is available!</span>
        </div>
      </div>
    </div>
  );
}

/* Scene 3: Add your links and share */
function SceneThree({ reducedMotion }: { reducedMotion: boolean }) {
  const links = [
    { label: "Portfolio & Shop", sub: "alexrivera.design" },
    { label: "Design Newsletter", sub: "substack.com/@alex" },
    { label: "Latest Exhibition", sub: "gallery.art/alex" },
    { label: "Book a Coffee Chat", sub: "cal.com/alex" },
  ];

  return (
    <div className="w-[260px] sm:w-[280px] bg-white rounded-[32px] border-3 border-ink shadow-[5px_5px_0px_#14181F] p-4 flex flex-col items-center select-none">
      {/* Mini Profile Header */}
      <div className="flex items-center gap-2.5 w-full pb-3 border-b border-hairline">
        <div className="w-8 h-8 rounded-full bg-forest text-lime font-heading font-extrabold text-xs flex items-center justify-center border border-ink">
          A
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading font-extrabold text-xs text-ink truncate leading-tight">
            Alex Rivera
          </div>
          <div className="text-[10px] text-ink/60 truncate font-mono">@alex</div>
        </div>
        {/* Pulsing Live Pill */}
        <div className="inline-flex items-center gap-1 bg-lime border border-ink text-ink text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full bg-forest ${reducedMotion ? "" : "animate-pulse"}`} />
          LIVE
        </div>
      </div>

      {/* 4 Staggered Link Rows */}
      <div className="w-full flex flex-col gap-2 mt-3">
        {links.map((link, idx) => (
          <div
            key={link.label}
            style={
              reducedMotion
                ? undefined
                : {
                    animationDelay: `${idx * 120 + 80}ms`,
                  }
            }
            className={`w-full bg-cream border border-ink/30 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs font-bold text-ink shadow-[1px_1px_0px_#14181F] ${
              reducedMotion ? "opacity-100" : "animate-slide-in-up"
            }`}
          >
            <div className="truncate">
              <span className="text-[11px] font-extrabold block leading-tight">{link.label}</span>
              <span className="text-[9px] text-ink/50 font-normal block leading-none">{link.sub}</span>
            </div>
            {/* Wiggling drag handle on first link */}
            <div
              className={`text-ink/40 shrink-0 ${
                idx === 0 && !reducedMotion ? "animate-wiggle-once [animation-delay:700ms]" : ""
              }`}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Shareable URL Chip */}
      <div
        className={`mt-3 w-full bg-cream border border-ink rounded-lg px-2 py-1 flex items-center justify-between text-[10px] font-mono font-bold text-ink/80 ${
          reducedMotion ? "opacity-100" : "animate-pop-in [animation-delay:750ms]"
        }`}
      >
        <span className="truncate">mylinks.com/alex</span>
        <Copy className="w-3 h-3 text-ink/50 shrink-0 ml-1" />
      </div>
    </div>
  );
}

export function StoryScroll() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Desktop step detection using center-weighted IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step-index"));
            if (!isNaN(index)) {
              setActiveStep(index);
            }
          }
        });
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0,
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const renderScene = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <SceneOne reducedMotion={prefersReducedMotion} />;
      case 1:
        return <SceneTwo reducedMotion={prefersReducedMotion} />;
      case 2:
        return <SceneThree reducedMotion={prefersReducedMotion} />;
      default:
        return null;
    }
  };

  return (
    <section
      id="how-it-works"
      aria-label="How it works"
      className="bg-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-hairline overflow-x-clip"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-ink/5 text-ink text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <span>3 Simple Steps</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-ink tracking-tight">
            From zero to live in a minute.
          </h2>
          <p className="mt-4 text-base sm:text-xl text-ink/70 font-medium">
            Three simple steps to build your public profile and start sharing your links.
          </p>
        </div>

        {/* DESKTOP VIEW (>= 1024px): 2 Columns with Sticky Right Panel */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-start relative">
          {/* Left Column: 3 Stacked Steps (~70vh each) */}
          <div className="flex flex-col">
            {STEPS.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={step.num}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  data-step-index={index}
                  className={`min-h-[70vh] flex flex-col justify-center transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-75"
                  }`}
                >
                  <div className="font-heading font-extrabold text-7xl xl:text-8xl text-ink leading-none mb-4 select-none">
                    {step.num}
                  </div>
                  <h3 className="font-heading font-extrabold text-3xl xl:text-4xl text-ink mb-3">
                    {step.title}
                  </h3>
                  <p className="text-ink/80 font-medium text-lg xl:text-xl max-w-md leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Solid-Color Panel */}
          <div className="sticky top-28 h-[520px] flex items-center justify-center">
            <div
              style={{ backgroundColor: STEPS[activeStep]?.color || "#D4E83A" }}
              className="w-full h-full rounded-[40px] border-2 border-ink shadow-[6px_6px_0px_#14181F] p-8 flex items-center justify-center transition-colors duration-500 ease-out overflow-hidden"
            >
              {/* Keyed scene to replay animations when step changes */}
              <div key={activeStep} className="w-full flex justify-center">
                {renderScene(activeStep)}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE/TABLET VIEW (< 1024px): Stack of Solid-Color Cards */}
        <div className="flex lg:hidden flex-col gap-8">
          {STEPS.map((step, index) => (
            <div
              key={step.num}
              style={{ backgroundColor: step.color }}
              className="rounded-[32px] sm:rounded-[40px] border-2 border-ink shadow-[4px_4px_0px_#14181F] p-6 sm:p-8 flex flex-col gap-8 text-ink"
            >
              <div>
                <div className="font-heading font-extrabold text-6xl sm:text-7xl text-ink leading-none mb-3">
                  {step.num}
                </div>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-ink/85 font-medium text-base sm:text-lg leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Scene inside mobile card */}
              <div className="flex justify-center pt-2 pb-2">
                {renderScene(index)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
