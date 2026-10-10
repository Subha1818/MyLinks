import { getCachedPublicPage } from "@/server/services/public-page";
import { notFound, permanentRedirect } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { ReportButton } from "./ReportButton";

type PageProps = {
  params: Promise<{ username: string }>;
};

// Disable standard Next.js layouts for this route by just rendering the view
// But wait, the root layout applies to all pages! We need to make sure the root layout doesn't interfere.
// The root layout usually just has <html> and <body> and maybe some shared providers.
// Let's assume the root layout is fine (it usually is).

import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username.toLowerCase();
  const page = await getCachedPublicPage(cleanUsername);

  if (!page) {
    return {
      title: "Page not found",
      robots: { index: false },
    };
  }

  const displayName = page.displayName || cleanUsername;
  const title = `${displayName} (@${cleanUsername})`;
  
  let description = `Check out ${displayName}'s links on ${siteConfig.name}.`;
  if (page.bio) {
    const plain = page.bio.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "").replace(/\s+/g, " ").trim();
    if (plain.length > 155) {
      description = plain.slice(0, 154).trim() + "…";
    } else {
      description = plain;
    }
  }

  const url = `/${cleanUsername}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  // If the parameter isn't lowercase, redirect permanently to lowercase
  if (username !== username.toLowerCase()) {
    permanentRedirect(`/${username.toLowerCase()}`);
  }

  const page = await getCachedPublicPage(username);

  if (!page) {
    notFound();
  }

  // We wrap ProfileView in a container that acts as the "screen"
  return (
    <main className="min-h-dvh flex flex-col items-stretch relative">
      <ProfileView
        mode="public"
        displayName={page.displayName || ""}
        bio={page.bio}
        avatarUrl={page.avatarUrl}
        links={page.links}
        theme={page.theme}
      />
      <ReportButton username={username} />
    </main>
  );
}
