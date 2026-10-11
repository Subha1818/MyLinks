"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const loggedIn = session ? !!session : isLoggedIn;

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      <nav
        aria-label="Main Navigation"
        className="bg-white rounded-full px-5 py-2.5 sm:px-6 sm:py-3 shadow-md border border-hairline flex items-center justify-between transition-all"
      >
        {/* Brand Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation Links: Themes, Features, FAQ */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#themes"
            className="text-sm font-bold text-ink/75 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-md px-1"
          >
            Themes
          </a>
          <a
            href="#features"
            className="text-sm font-bold text-ink/75 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-md px-1"
          >
            Features
          </a>
          <a
            href="#faq"
            className="text-sm font-bold text-ink/75 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-md px-1"
          >
            FAQ
          </a>
        </div>

        {/* Desktop CTA actions */}
        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard">
              <Button variant="primary" size="40px">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-ink/75 hover:text-ink px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-full"
              >
                Log in
              </Link>
              <Link href="/login">
                <Button variant="primary" size="40px">
                  Sign up free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {loggedIn ? (
            <Link href="/dashboard">
              <Button variant="primary" size="40px" className="text-xs h-9 px-3">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="40px" className="text-xs h-9 px-3">
                Log in
              </Button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-full text-ink hover:bg-cream transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-5 bg-white rounded-[28px] shadow-xl border border-hairline flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#themes"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-bold text-ink px-3 py-2.5 rounded-xl hover:bg-cream transition-colors"
          >
            Themes
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-bold text-ink px-3 py-2.5 rounded-xl hover:bg-cream transition-colors"
          >
            Features
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-bold text-ink px-3 py-2.5 rounded-xl hover:bg-cream transition-colors"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-hairline flex flex-col gap-2">
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="primary" size="48px" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="secondary" size="48px" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="48px" className="w-full">
                    Sign up free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
