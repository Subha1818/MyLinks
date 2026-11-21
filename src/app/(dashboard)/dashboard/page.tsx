export const instant = false;
import { PageHeader } from "@/components/ui/page-header";
import { OverviewStrip } from "@/components/dashboard/overview-strip";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SocialIconsCard } from "@/components/dashboard/social-icons-card";
import { LinksList } from "@/components/dashboard/links-list";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { getBlocksWithClicks } from "@/server/services/blocks";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Links",
};

export default async function LinksPage() {
  const session = await requireUser();
  const page = await getPageByUserId(session.user.id);

  if (!page) {
    redirect("/onboarding");
  }

  const allBlocks = await getBlocksWithClicks(page.id);

  // Link and header stream for the links list
  const streamBlocks = allBlocks
    .filter((b) => b.type === "link" || b.type === "header")
    .map((b) => ({
      id: b.id,
      type: b.type as "link" | "header",
      title: b.title,
      url: b.url || "",
      position: b.position,
      isVisible: b.isVisible,
      clickCount: b.clickCount,
      platform: b.platform,
      layout: b.layout,
      thumbnailUrl: b.thumbnailUrl,
      thumbnailAlt: b.thumbnailAlt,
      isHighlighted: b.isHighlighted,
    }));

  // Total clicks from ALL the page's blocks (link + social)
  const totalClicks = allBlocks.reduce(
    (acc, b) => acc + (b.clickCount || 0),
    0
  );

  // "Links live" and 50-link limit count ONLY links (not headers)
  const onlyLinks = allBlocks.filter((b) => b.type === "link");
  const visibleLinks = onlyLinks.filter((b) => b.isVisible).length;
  const totalLinks = onlyLinks.length;

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

        {/* Social Icons Card (between Profile card and Links card) */}
        <SocialIconsCard />

        {/* Links Card */}
        <LinksList initialLinks={streamBlocks} />
      </div>

      <div>
        <PhonePreview />
      </div>
    </div>
  );
}
