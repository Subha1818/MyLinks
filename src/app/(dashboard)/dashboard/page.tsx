import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Link2, Plus } from "lucide-react";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
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

  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="flex-1">
          <PageHeader
            title="Your links"
            description="Manage your profile and organize your links."
          />
        </div>
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 bg-ink text-cream font-bold text-sm sm:text-base py-3 px-6 rounded-full opacity-50 cursor-not-allowed mb-1"
        >
          <Plus className="w-5 h-5" />
          <span>Add link</span>
        </button>
      </div>

      <ProfileForm
        initialData={{
          displayName: page.displayName,
          bio: page.bio,
          avatarUrl: page.avatarUrl,
          username: page.username,
        }}
      />

      <EmptyState
        icon={Link2}
        title="No links yet"
        description="Link management arrives in the next step. You'll be able to add, edit, and organize your links here."
      />
    </div>
  );
}

