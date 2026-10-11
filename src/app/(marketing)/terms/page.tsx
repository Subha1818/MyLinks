/* DRAFT: review before launch. This is not legal advice. */

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { siteConfig } from "@/lib/site";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MyLinks",
  description:
    "Plain-language Terms of Service outlining acceptable use, content ownership, and service rules.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <div className="flex flex-col min-h-screen bg-cream text-ink">
      <div className="bg-lime pt-4 pb-12 sm:pb-16 px-4">
        <Navbar />

        <div className="max-w-3xl mx-auto mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-forest text-lime text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-forest tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm sm:text-base font-bold text-forest/80">
            Last updated: October 11, 2026
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-[28px] border border-hairline p-6 sm:p-10 shadow-xs space-y-8 leading-relaxed font-medium text-ink/80 text-[15px] sm:text-base">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs sm:text-sm font-bold">
            Note: This document is a plain-language draft outlining the rules for using
            the {siteConfig.name} platform. It is not formal legal advice.
          </div>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              1. Acceptance of Terms
            </h2>
            <p>
              By signing in with Google and using {siteConfig.name}, you agree to
              comply with these Terms of Service. If you do not agree with any of
              these terms, you must discontinue use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              2. Acceptable Use
            </h2>
            <p>
              {siteConfig.name} is intended to provide a clean, modern link-in-bio
              experience. You agree NOT to use the service for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Publishing links to illegal material, malware, spyware, phishing
                sites, or deceptive scams.
              </li>
              <li>
                Impersonating other individuals, celebrities, brands, or public
                entities without authorization.
              </li>
              <li>
                Engaging in harassment, hate speech, threats, or defamation.
              </li>
              <li>
                Distributing automated spam, bulk unsolicited messages, or
                disrupting service operation.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              3. Content Ownership &amp; License
            </h2>
            <p>
              <strong>You own your content:</strong> You retain full ownership and
              intellectual property rights over the display names, bios, avatar
              images, and links you publish on {siteConfig.name}.
            </p>
            <p>
              By publishing content through {siteConfig.name}, you grant us a
              worldwide, non-exclusive license solely to host, display, and format
              your content as required to deliver your public page and social preview
              cards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              4. Account Suspension &amp; Content Removal
            </h2>
            <p>
              We reserve the right to review public profiles, investigate abuse
              reports, and remove links or suspend accounts that violate these
              terms or harm other users, at our reasonable discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              5. Disclaimer of Warranties
            </h2>
            <p>
              The service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS
              AVAILABLE&rdquo; basis without warranties of any kind, whether express
              or implied. While we strive for high uptime and fast response times,
              we cannot guarantee uninterrupted operation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, {siteConfig.name}{" "}
              and its operators shall not be liable for any indirect, incidental,
              or consequential damages resulting from your use of or inability to use
              the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              7. Contact &amp; Questions
            </h2>
            <p>
              Questions about these Terms of Service can be directed to us
              {contactEmail ? (
                <>
                  {" "}via email at{" "}
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
            <Link href="/privacy" className="text-forest hover:underline">
              Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
