import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Logo } from "@/components/landing/logo";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer
      aria-label="Footer"
      className="bg-forest text-cream pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-forest/20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <Logo textColor="text-white" markColor="text-lime" />
            <p className="mt-2 text-sm text-white/70 max-w-sm font-medium">
              {siteConfig.tagline} Simple, bold, and crafted for modern creators.
            </p>
          </div>

          <nav
            aria-label="Footer links"
            className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-semibold text-white/80"
          >
            <Link
              href="#features"
              className="hover:text-lime transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-lime transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#themes"
              className="hover:text-lime transition-colors"
            >
              Themes
            </Link>
            <Link
              href="/login"
              className="hover:text-lime transition-colors"
            >
              Log in
            </Link>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-white/50 cursor-not-allowed" title="Coming soon">
              Privacy
            </span>
            <span className="text-white/50 cursor-not-allowed" title="Coming soon">
              Terms
            </span>
            <span className="text-white/50 cursor-not-allowed" title="Coming soon">
              Contact
            </span>
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
