import { getPublicPageByUsername } from "@/server/services/public-page";
import { notFound, permanentRedirect } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";

type PageProps = {
  params: Promise<{ username: string }>;
};

// Disable standard Next.js layouts for this route by just rendering the view
// But wait, the root layout applies to all pages! We need to make sure the root layout doesn't interfere.
// The root layout usually just has <html> and <body> and maybe some shared providers.
// Let's assume the root layout is fine (it usually is).

export const instant = false;

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  // If the parameter isn't lowercase, redirect permanently to lowercase
  if (username !== username.toLowerCase()) {
    permanentRedirect(`/${username.toLowerCase()}`);
  }

  const page = await getPublicPageByUsername(username);

  if (!page) {
    notFound();
  }

  // We wrap ProfileView in a container that acts as the "screen"
  return (
    <main className="min-h-dvh flex flex-col items-stretch">
      <ProfileView
        mode="public"
        displayName={page.displayName || ""}
        bio={page.bio}
        avatarUrl={page.avatarUrl}
        links={page.links}
        theme={page.theme}
      />
    </main>
  );
}
