export const instant = false;
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";

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
    <div className="min-h-screen bg-cream">
      {/* 
        This is just the dashboard shell layout for Phase 2.
        Navigation and real UI will be added in Phase 3.
      */}
      <nav className="bg-white border-b-2 border-ink/10 px-6 py-4 flex items-center justify-between">
        <div className="font-heading font-extrabold text-xl">MyLinks</div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-ink/70">
            {session.user.email}
          </div>
          <a href="/api/auth/signout" className="text-sm font-bold text-coral hover:underline">
            Logout
          </a>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}
