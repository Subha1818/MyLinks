import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LinksList } from "@/components/dashboard/links-list";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { PageDraftProvider } from "@/components/dashboard/PageDraftProvider";
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

  const draftState = {
    displayName: page.displayName || "",
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    username: page.username,
    theme: page.theme,
    blocks: formattedBlocks,
  };

  return (
    <PageDraftProvider initialState={draftState}>
      <div className="w-full max-w-6xl pb-24 xl:grid xl:grid-cols-[1fr_320px] xl:gap-12">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div className="flex-1">
              <PageHeader
                title="Your links"
                description="Manage your profile and organize your links."
              />
            </div>
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

        <div>
          <PhonePreview />
        </div>
      </div>
    </PageDraftProvider>
  );
}

