import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Palette } from "lucide-react";

export const metadata = {
  title: "Appearance | Dashboard",
};

export default function AppearancePage() {
  return (
    <div className="w-full max-w-3xl">
      <PageHeader
        title="Appearance"
        description="Customize the look and feel of your page."
      />

      <EmptyState
        icon={Palette}
        title="Themes coming soon"
        description="Theme customization and profile editing will arrive in a later step. Check back soon!"
      />
    </div>
  );
}
