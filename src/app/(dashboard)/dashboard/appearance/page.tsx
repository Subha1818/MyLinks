import { PageHeader } from "@/components/dashboard/page-header";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { ThemeSelector } from "@/components/dashboard/appearance/theme-selector";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Appearance | Dashboard",
};

export default async function AppearancePage() {
  const session = await requireUser();
  const page = await getPageByUserId(session.user.id);

  if (!page) {
    redirect("/onboarding");
  }

  return (
    <div className="w-full max-w-6xl pb-24 xl:grid xl:grid-cols-[1fr_320px] xl:gap-12">
      <div className="min-w-0 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="flex-1">
            <PageHeader
              title="Appearance"
              description="Customize the look and feel of your page."
            />
          </div>
        </div>

        <ThemeSelector initialTheme={page.theme} />
      </div>

      <div>
        <PhonePreview />
      </div>
    </div>
  );
}
