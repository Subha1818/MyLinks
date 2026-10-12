import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Logo } from "@/components/landing/logo";

export function Footer() {
  const currentYear = 2026;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <footer
      aria-label="Footer"
      className="bg-forest text-cream pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-forest/20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <Logo textColor="text-white" />
            <p className="mt-2 text-sm text-white/70 max-w-sm font-medium">
              {siteConfig.tagline}
            </p>
          </div>

          <nav
            aria-label="Footer links"
            className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-semibold text-white/80"
          >
            <Link
              href="#themes"
              className="hover:text-lime transition-colors"
            >
              Themes
            </Link>
            <Link
              href="#features"
              className="hover:text-lime transition-colors"
            >
              Features
            </Link>
            <Link
              href="#faq"
              className="hover:text-lime transition-colors"
            >
              FAQ
            </Link>
            <span className="text-white/20 hidden sm:inline" aria-hidden="true">
              |
            </span>
            <Link
              href="/privacy"
              className="hover:text-lime transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-lime transition-colors"
            >
              Terms
            </Link>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-lime transition-colors"
              >
                Contact
              </a>
            )}
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-white/50">
          <p>
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Built with solid colors &amp; pure focus.</span>
            <span className="text-lime">✦</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
