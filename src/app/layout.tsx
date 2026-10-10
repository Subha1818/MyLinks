import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  Fraunces,
  DM_Mono,
  Archivo,
  Caveat,
} from "next/font/google";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Site-wide default fonts (preloaded by default for immediate branding/body text)
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Custom theme fonts: preload: false so browser downloads them only when rendered via CSS variable
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    url: appUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${fraunces.variable} ${dmMono.variable} ${archivo.variable} ${caveat.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-cream text-ink font-body selection:bg-lime selection:text-forest">
        {children}
      </body>
    </html>
  );
}
