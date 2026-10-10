export const instant = false;
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { getBlocksWithClicks } from "@/server/services/blocks";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { PageDraftProvider } from "@/components/dashboard/PageDraftProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const page = await getPageByUserId(session.user.id);
  
  if (!page) {
    redirect("/onboarding");
  }

  const blocks = await getBlocksWithClicks(page.id);
  const formattedBlocks = blocks.map((b) => ({
    id: b.id,
    title: b.title,
    url: b.url,
    position: b.position,
    isVisible: b.isVisible,
    clickCount: b.clickCount,
  }));

  const draftState = {
    displayName: page.displayName || "",
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    username: page.username,
    theme: page.theme,
    blocks: formattedBlocks,
  };

  return (
    <div className="min-h-screen bg-cream lg:flex text-ink">
      <Sidebar page={page} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        <TopBar page={page} />
        
        <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-0">
          <PageDraftProvider initialState={draftState}>
            {children}
          </PageDraftProvider>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
