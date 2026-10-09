import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LinksList } from "@/components/dashboard/links-list";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { listBlocks } from "@/server/services/blocks";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Links | Dashboard",
};

export default async function LinksPage() {
  const session = await requireUser();
  const page = await getPageByUserId(session.user.id);

  if (!page) {
    redirect("/onboarding");
  }

  const blocks = await listBlocks(page.id);
  const formattedBlocks = blocks.map((b) => ({
    id: b.id,
    title: b.title,
    url: b.url,
    position: b.position,
    isVisible: b.isVisible,
  }));

  return (
    <div className="w-full max-w-3xl pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="flex-1">
          <PageHeader
            title="Your links"
            description="Manage your profile and organize your links."
          />
        </div>
        {/* We moved the Add Link button inside LinksList to easily open the modal, but actually the button is better placed here visually. Wait, if we put it here, it can't directly open the modal inside LinksList unless we lift state. Let's keep it in LinksList. */}
      </div>

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
  );
}

