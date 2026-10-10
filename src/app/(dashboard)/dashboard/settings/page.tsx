export const instant = false;
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/dashboard/card";
import { SignOutButton, SignOutAllButton } from "@/components/dashboard/sign-out-button";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

export const metadata = {
  title: "Settings | Dashboard",
};

export default async function SettingsPage() {
  const session = await requireUser();
  const page = await getPageByUserId(session.user.id);

  if (!page) {
    redirect("/onboarding");
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://mylinks.com"}/${page.username}`;

  return (
    <div className="w-full max-w-3xl pb-24">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <div className="space-y-6">
        <Card>
          <h2 className="font-heading font-bold text-xl text-ink mb-6">
            Account Details
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <Avatar
                src={page.avatarUrl || session.user.image}
                fallback={page.displayName || session.user.name || page.username}
                size="xl"
              />
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-1">
                  Display Name
                </label>
                <div className="px-4 py-3 bg-cream border border-ink/10 rounded-xl text-ink font-medium">
                  {session.user.name || "No name set"}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-1">
                  Email
                </label>
                <div className="px-4 py-3 bg-cream border border-ink/10 rounded-xl text-ink font-medium">
                  {session.user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink/70 mb-1">
                  Username
                </label>
                <div className="px-4 py-3 bg-cream border border-ink/10 rounded-xl text-ink font-medium">
                  @{page.username}
                </div>
                <p className="mt-2 text-xs text-ink/60 font-medium">
                  Username changes are not available yet.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading font-bold text-xl text-ink mb-2">
            Public Page
          </h2>
          <p className="text-ink/70 text-sm mb-6">
            This is your live link. Share it with your audience!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 px-4 py-3 bg-cream border border-ink/10 rounded-xl text-ink font-medium truncate w-full text-sm">
              {publicUrl}
            </div>
            <div className="w-full sm:w-auto">
              <CopyLinkButton username={page.username} />
            </div>
          </div>
        </Card>

        <div className="pt-4 border-t border-ink/10 space-y-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-ink">
              Session & Security
            </h2>
            <p className="mt-1 text-sm text-ink/70 font-medium">
              You stay signed in on this device for 30 days of activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SignOutButton />
            <SignOutAllButton />
          </div>
        </div>
      </div>
    </div>
  );
}
