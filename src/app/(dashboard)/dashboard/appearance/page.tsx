export const instant = false;
import { PageHeader } from "@/components/ui/page-header";
import { PhonePreview, MobileInlinePhonePreview } from "@/components/dashboard/PhonePreview";
import { ThemeSelector } from "@/components/dashboard/appearance/theme-selector";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { redirect } from "next/navigation";
import { Palette } from "lucide-react";

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
        {/* Color-coded page header band: lilac band with deep purple text */}
        <PageHeader
          title="Appearance"
          description="Customize the colors, typography, shapes, and layout of your public page."
          variant="lilac"
          icon={<Palette className="w-6 h-6 stroke-[2.2]" />}
        />

        {/* Inline mobile preview - shown between header and presets on mobile */}
        <MobileInlinePhonePreview />

        <ThemeSelector initialTheme={page.theme} />
      </div>

      <div>
        <PhonePreview />
      </div>
    </div>
  );
}
