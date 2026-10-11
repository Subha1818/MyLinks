export const instant = false;
import { PageHeader } from "@/components/ui/page-header";
import { OverviewStrip } from "@/components/dashboard/overview-strip";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LinksList } from "@/components/dashboard/links-list";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { getBlocksWithClicks } from "@/server/services/blocks";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Links | Dashboard",
};

export default async function LinksPage() {
  const session = await requireUser();
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

  const totalClicks = formattedBlocks.reduce(
    (acc, b) => acc + (b.clickCount || 0),
    0
  );
  const visibleLinks = formattedBlocks.filter((b) => b.isVisible).length;
  const totalLinks = formattedBlocks.length;

  return (
    <div className="w-full max-w-6xl pb-24 xl:grid xl:grid-cols-[1fr_320px] xl:gap-12">
      <div className="min-w-0 max-w-3xl">
        {/* Color-coded page header band: lime band with forest text */}
        <PageHeader
          title="Your links"
          description="Manage your profile, track link engagement, and organize what you share."
          variant="lime"
          icon={<LayoutDashboard className="w-6 h-6 stroke-[2.2]" />}
        />

        {/* Overview stat strip: Total clicks, Links live, Your link */}
        <OverviewStrip
          username={page.username}
          totalClicks={totalClicks}
          visibleLinks={visibleLinks}
          totalLinks={totalLinks}
        />

        <ProfileForm
          initialData={{
            displayName: page.displayName,
            bio: page.bio,
            avatarUrl: page.avatarUrl,
            username: page.username,
          }}
        />

        <LinksList initialLinks={formattedBlocks} />
      </div>

      <div>
        <PhonePreview />
      </div>
    </div>
  );
}
