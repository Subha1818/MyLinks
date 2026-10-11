import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { PrivacyReceipt } from "./privacy-receipt";

export function PrivacyBand() {
  return (
    <section
      aria-label="Privacy and analytics principles"
      className="bg-cobalt text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-hairline"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline, Copy, and Privacy Policy Link */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 self-start bg-white/15 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy First</span>
            </div>
            <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
              Stats without surveillance.
            </h2>
            <p className="mt-4 text-base sm:text-xl text-white/85 font-medium leading-relaxed">
              Understand which links your audience engages with without compromising
              their digital privacy. We never place visitor cookies, log IP addresses,
              or load third-party ad tracking scripts.
            </p>
            <p className="mt-3 text-sm sm:text-base text-white/75 font-medium leading-relaxed">
              When a visitor opens a link, our redirect logs only the event timestamp,
              link ID, coarse country header, and device category. That is the
              complete record.
            </p>

            <div className="mt-8">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-cobalt hover:bg-cream font-bold text-sm transition-all duration-150 shadow-md shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cobalt"
              >
                <span>Read Privacy Policy</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Paper Receipt Demo */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <PrivacyReceipt />
          </div>
        </div>
      </div>
    </section>
  );
}
