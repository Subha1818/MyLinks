"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      <nav
        aria-label="Main Navigation"
        className="bg-white rounded-full px-5 py-2.5 sm:px-6 sm:py-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-ink/10 flex items-center justify-between transition-all"
      >
        {/* Brand Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-ink/80 hover:text-ink transition-colors hover:font-semibold"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-ink/80 hover:text-ink transition-colors hover:font-semibold"
          >
            How it works
          </a>
          <a
            href="#themes"
            className="text-sm font-medium text-ink/80 hover:text-ink transition-colors hover:font-semibold"
          >
            Themes
          </a>
        </div>

        {/* Desktop CTA actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-ink/80 hover:text-ink px-3 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link href="/login">
            <Button variant="dark" size="sm">
              Sign up free
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="text-xs font-semibold text-ink px-2 py-1">
            Log in
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-full text-ink hover:bg-cream transition-colors focus-visible:ring-2 focus-visible:ring-ink"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-5 bg-white rounded-3xl shadow-xl border border-ink/10 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-ink px-3 py-2 rounded-xl hover:bg-cream transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-ink px-3 py-2 rounded-xl hover:bg-cream transition-colors"
          >
            How it works
          </a>
          <a
            href="#themes"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-ink px-3 py-2 rounded-xl hover:bg-cream transition-colors"
          >
            Themes
          </a>
          <div className="pt-2 border-t border-ink/10 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-ink rounded-full border border-ink/15 hover:bg-cream"
            >
              Log in
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="dark" size="sm" className="w-full">
                Sign up free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
