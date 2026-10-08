export const instant = false;
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Check if user has already completed onboarding
  const page = await getPageByUserId(session.user.id);
  
  if (page) {
    // If they already have a page, send them to dashboard
    redirect("/dashboard");
  }

  return <>{children}</>;
}
