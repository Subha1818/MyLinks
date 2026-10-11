import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export function PrivacyBand() {
  return (
    <section
      aria-label="Privacy and analytics principles"
      className="bg-cobalt text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy First</span>
            </div>
            <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
              Stats without surveillance.
            </h2>
            <p className="mt-4 text-base sm:text-xl text-white/85 font-medium max-w-2xl leading-relaxed">
              Understand which links your audience engages with without compromising
              their digital privacy.
            </p>
          </div>

          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-cobalt hover:bg-cream font-bold text-sm transition-all duration-150 shadow-md shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            <span>Read Privacy Policy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Honest Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white/10 border border-white/20 rounded-[24px] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <span className="text-lime font-extrabold text-lg block mb-2">
                ✦ Zero Visitor Cookies
              </span>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-medium">
                We never store cookies, advertising pixels, or local storage tokens
                on your visitors&apos; browsers.
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-[24px] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <span className="text-lime font-extrabold text-lg block mb-2">
                ✦ No IP Addresses Stored
              </span>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-medium">
                Click tracking records only the timestamp and coarse country code.
                We never log or save visitor IP addresses.
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-[24px] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <span className="text-lime font-extrabold text-lg block mb-2">
                ✦ Zero Surveillance Bloat
              </span>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-medium">
                With no third-party ad trackers or heavy telemetry scripts, your
                page loads lightning-fast on every mobile phone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
