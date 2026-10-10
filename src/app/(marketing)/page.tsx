export const instant = false;
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ThemeShowcase } from "@/components/landing/theme-showcase";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { getSession } from "@/server/session";

export default async function MarketingPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Banner & Hero Area */}
      <div className="bg-lime pt-4">
        <Navbar isLoggedIn={!!session} />
        <Hero />
      </div>

      {/* Main Content Sections */}
      <main>
        <FeaturesBento />
        <HowItWorks />
        <ThemeShowcase />
        <FinalCta />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
