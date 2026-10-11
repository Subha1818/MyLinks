/* DRAFT: review before launch. This is not legal advice. */

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { siteConfig } from "@/lib/site";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | MyLinks",
  description:
    "Plain-language explanation of what data MyLinks collects and how visitor privacy is respected.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <div className="flex flex-col min-h-screen bg-cream text-ink">
      <div className="bg-lime pt-4 pb-12 sm:pb-16 px-4">
        <Navbar />

        <div className="max-w-3xl mx-auto mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-forest text-lime text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-forest tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base font-bold text-forest/80">
            Last updated: October 11, 2026
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-[28px] border border-hairline p-6 sm:p-10 shadow-xs space-y-8 leading-relaxed font-medium text-ink/80 text-[15px] sm:text-base">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs sm:text-sm font-bold">
            Note: This document is a plain-language draft describing how the
            {siteConfig.name} application operates today. It is not formal legal advice.
          </div>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              1. Overview
            </h2>
            <p>
              At {siteConfig.name}, we believe in providing creators with tools
              to share links without invading visitor privacy. This policy outlines
              what information we collect from registered account holders and public
              visitors, how we store that data, and your rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              2. Data Collected from Account Holders
            </h2>
            <p>
              When you sign up and manage a {siteConfig.name} account, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Google Account Information:</strong> Your name, email
                address, and Google profile picture, provided securely during Google
                Sign-In authentication.
              </li>
              <li>
                <strong>Profile &amp; Page Data:</strong> The username handle you
                choose, your display name, biography text, profile avatar image, and
                theme customization preferences.
              </li>
              <li>
                <strong>Link Data:</strong> The titles, destination URLs, positions,
                and visibility settings of up to 50 links you add to your profile.
              </li>
              <li>
                <strong>Authentication Sessions:</strong> An encrypted httpOnly
                session cookie stored in your browser to keep you logged in securely
                for up to 30 days of active usage.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              3. Data Collected from Public Visitors
            </h2>
            <p>
              We are committed to visitor privacy and intentionally minimize data
              collection:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Zero Visitor Cookies:</strong> We never set tracking
                cookies, advertising pixels, or local storage identifiers on
                visitors who view public link pages.
              </li>
              <li>
                <strong>No IP Addresses Stored:</strong> When a visitor clicks a
                link redirect, we increment that link’s click counter and record the
                timestamp, coarse country header (as reported by hosting infrastructure),
                and general device type (mobile, tablet, or desktop). We do NOT log
                or store visitor IP addresses or full browser user-agent strings.
              </li>
              <li>
                <strong>Abuse Reports:</strong> If a visitor submits an abuse report
                for a page, we record the selected reason and optional text details.
                We do not require or collect reporter identities.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              4. Third-Party Infrastructure
            </h2>
            <p>
              To run the application reliably, we rely on established cloud
              infrastructure providers:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Google Identity Services:</strong> Provides OAuth 2.0
                authentication for secure login.
              </li>
              <li>
                <strong>Neon:</strong> Provides serverless PostgreSQL database
                hosting where account, link, and aggregated click records are stored.
              </li>
              <li>
                <strong>Vercel:</strong> Provides web hosting and Vercel Blob storage
                for user-uploaded avatar image files.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              5. Data Retention &amp; Deletion
            </h2>
            <p>
              Your account and profile data remain stored as long as your account
              exists. You may update your profile or delete individual links at any
              time directly in the dashboard.
            </p>
            <p>
              If you wish to delete your entire account and all associated profile
              records and uploaded images, you may request account deletion
              {contactEmail ? (
                <>
                  {" "}by emailing us at{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-bold text-forest underline"
                  >
                    {contactEmail}
                  </a>
                </>
              ) : (
                " through your settings or by contacting the site administrator"
              )}
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              6. Contact
            </h2>
            <p>
              If you have any questions or feedback regarding this policy, please
              reach out to us
              {contactEmail ? (
                <>
                  {" "}at{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-bold text-forest underline"
                  >
                    {contactEmail}
                  </a>
                </>
              ) : (
                " through our support channels"
              )}
              .
            </p>
          </section>

          <div className="pt-6 border-t border-hairline flex justify-between items-center text-sm font-bold">
            <Link href="/" className="text-forest hover:underline">
              &larr; Back to Home
            </Link>
            <Link href="/terms" className="text-forest hover:underline">
              Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
