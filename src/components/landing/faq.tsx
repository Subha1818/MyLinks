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
      className="bg-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-hairline"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-ink/5 text-ink text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <span>FAQ</span>
          </div>
          <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-ink tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base sm:text-xl text-ink/70 font-medium">
            Clear, honest answers about how MyLinks works.
          </p>
        </div>

        {/* Accordion using native accessible <details> and <summary> */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-[24px] bg-white border border-hairline p-6 sm:p-7 transition-all duration-150 open:shadow-xs"
            >
              <summary className="flex items-center justify-between gap-4 font-heading font-extrabold text-lg sm:text-xl text-ink cursor-pointer list-none select-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-xl">
                <span>{item.q}</span>
                <span className="w-8 h-8 rounded-full bg-cream border border-hairline flex items-center justify-center shrink-0 text-ink/70 group-open:rotate-45 transition-transform duration-200">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-hairline text-ink/80 font-medium text-base sm:text-lg leading-relaxed">
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
