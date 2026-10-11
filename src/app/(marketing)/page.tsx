import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ThemeShowcase } from "@/components/landing/theme-showcase";
import { PrivacyBand } from "@/components/landing/privacy-band";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: appUrl,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function MarketingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: appUrl,
    description: siteConfig.description,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* WebSite Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Banner & Hero Area (Lime Band) */}
      <div className="bg-lime pt-4">
        <Navbar />
        <Hero />
      </div>

      {/* Alternating Solid Color Main Content Sections */}
      <main>
        {/* Features Bento (Cream) */}
        <FeaturesBento />

        {/* How It Works (Forest) */}
        <HowItWorks />

        {/* Theme Showcase (Cream) */}
        <ThemeShowcase />

        {/* Privacy Band (Cobalt) */}
        <PrivacyBand />

        {/* FAQ (Cream) */}
        <Faq />

        {/* Final CTA (Mustard) */}
        <FinalCta />
      </main>

      {/* Footer (Forest) */}
      <Footer />
    </div>
  );
}
