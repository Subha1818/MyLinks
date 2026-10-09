export const instant = false;
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

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

  return (
    <div className="min-h-screen bg-cream lg:flex text-ink">
      <Sidebar page={page} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        <TopBar page={page} />
        
        <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-0">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
