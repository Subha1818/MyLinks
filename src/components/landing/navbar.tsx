"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "themes", label: "Themes" },
  { id: "features", label: "Features" },
  { id: "faq", label: "FAQ" },
] as const;

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { data: session } = useSession();
  const loggedIn = session ? !!session : isLoggedIn;

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const sorted = [...intersecting].sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );
          setActiveSection(sorted[0].target.id);
        } else if (window.scrollY < 180) {
          setActiveSection(null);
        }
      },
      {
        rootMargin: "-15% 0px -50% 0px",
        threshold: [0, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      if (window.scrollY < 150) {
        setActiveSection(null);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      <nav
        aria-label="Main Navigation"
        className="bg-white rounded-full px-4 sm:px-6 py-2.5 shadow-md border border-hairline flex items-center justify-between min-h-[64px] transition-all"
      >
        {/* Brand Logo */}
        <div className="flex items-center shrink-0">
          <Logo />
        </div>

        {/* Desktop Navigation Links: Themes, Features, FAQ */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "font-heading font-semibold text-[16px] tracking-[-0.02em] px-4 py-2 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest cursor-pointer select-none",
                  isActive
                    ? "bg-lime text-forest font-bold"
                    : "text-ink hover:bg-lime hover:text-forest"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA actions - fixed min-w to prevent layout shift */}
        <div className="hidden md:flex items-center justify-end gap-3 min-w-[210px] shrink-0">
          {loggedIn ? (
            <Link href="/dashboard">
              <Button
                variant="primary"
                pendingText="Opening..."
                className="h-[44px] px-5 font-heading font-semibold text-[16px] tracking-[-0.02em] rounded-full"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  pendingText="Opening..."
                  className="h-[44px] px-4 font-heading font-semibold text-[16px] tracking-[-0.02em] rounded-full text-ink hover:bg-cream hover:text-ink"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="primary"
                  pendingText="Opening..."
                  className="h-[44px] px-5 font-heading font-semibold text-[16px] tracking-[-0.02em] rounded-full"
                >
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
              <Button
                variant="primary"
                pendingText="Opening..."
                className="h-[40px] px-3.5 font-heading font-semibold text-sm tracking-[-0.02em] rounded-full"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="primary"
                pendingText="Opening..."
                className="h-[40px] px-3.5 font-heading font-semibold text-sm tracking-[-0.02em] rounded-full"
              >
                Log in
              </Button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="w-10 h-10 rounded-full text-ink hover:bg-cream flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-panel"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-panel"
          className="md:hidden mt-2 p-4 bg-white rounded-[28px] shadow-xl border border-hairline flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "min-h-[48px] px-4 py-3 rounded-2xl flex items-center font-heading font-semibold text-[17px] tracking-[-0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                  isActive
                    ? "bg-lime text-forest font-bold"
                    : "text-ink hover:bg-lime hover:text-forest"
                )}
              >
                {link.label}
              </a>
            );
          })}

          <div className="pt-3 mt-2 border-t border-hairline flex flex-col gap-2">
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button
                  variant="primary"
                  pendingText="Opening..."
                  className="w-full min-h-[48px] h-12 font-heading font-semibold text-[16px] tracking-[-0.02em] rounded-full"
                >
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
                  <Button
                    variant="secondary"
                    pendingText="Opening..."
                    className="w-full min-h-[48px] h-12 font-heading font-semibold text-[16px] tracking-[-0.02em] rounded-full"
                  >
                    Log in
                  </Button>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    pendingText="Opening..."
                    className="w-full min-h-[48px] h-12 font-heading font-semibold text-[16px] tracking-[-0.02em] rounded-full"
                  >
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
