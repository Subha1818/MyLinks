import Link from "next/link";
import { Plus } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Is MyLinks free to use?",
    a: "Yes. MyLinks is completely free to start. You can claim your username, customize your theme, add links, and share your public profile without paying or entering a credit card.",
  },
  {
    q: "Do I need a password to sign in?",
    a: "No. We use Google Sign-In as our authentication provider. You sign in with your verified Google account in one tap, so there are no passwords to remember, lose, or reset.",
  },
  {
    q: "Can I customize how my page looks?",
    a: "Yes! You can choose from 14 ready-made theme presets or customize individual colors, button shapes (pill, rounded, square), button styles (solid, outline, hard-shadow), 6 Google fonts, and CSS pattern backgrounds.",
  },
  {
    q: "How many links can I add?",
    a: "You can add up to 50 links to your profile. You can reorder them anytime using drag-and-drop handles, and easily hide or show links without deleting them.",
  },
  {
    q: "What do you do with my visitors' data?",
    a: "We never place tracking cookies or pixels on your visitors' devices, and we never log or store visitor IP addresses. Click tracking only records the event timestamp, link ID, coarse country header, and device category. Check our Privacy Policy for complete details.",
    hasPrivacyLink: true,
  },
  {
    q: "Can I use my own custom domain?",
    a: "Not yet. Currently, your public profile lives at your unique username URL. Custom domains are planned for a future update.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="bg-mint text-forest py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t-2 border-forest/15"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-forest text-lime text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider shadow-sm">
            <span>FAQ</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-forest tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base sm:text-xl text-forest/85 font-medium">
            Clear, honest answers about how MyLinks works.
          </p>
        </div>

        {/* Accordion using native accessible <details> and <summary> */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-[24px] bg-white border-2 border-forest/15 p-6 sm:p-7 transition-all duration-150 shadow-sm open:border-forest open:shadow-md hover:border-forest/35"
            >
              <summary className="flex items-center justify-between gap-4 font-heading font-extrabold text-lg sm:text-xl text-forest cursor-pointer list-none select-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-xl">
                <span>{item.q}</span>
                <span className="w-8 h-8 rounded-full bg-mint/50 border border-forest/20 flex items-center justify-center shrink-0 text-forest group-open:rotate-45 transition-transform duration-200">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-forest/10 text-ink/80 font-medium text-base sm:text-lg leading-relaxed">
                {item.a}
                {item.hasPrivacyLink && (
                  <span className="block mt-2">
                    <Link
                      href="/privacy"
                      className="font-bold text-forest underline hover:text-ink transition-colors"
                    >
                      Read our Privacy Policy &rarr;
                    </Link>
                  </span>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
