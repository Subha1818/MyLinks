export const instant = false;
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/dashboard/card";
import { SignOutButton, SignOutAllButton } from "@/components/dashboard/sign-out-button";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { requireUser } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Globe, Lock, ExternalLink, ShieldCheck } from "lucide-react";

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
        description="Manage your account settings, public link, and authentication."
        variant="orange"
      />

      <div className="space-y-6">
        {/* Card 1: Account Details */}
        <Card className="border-2 border-ink/10 rounded-[32px] p-6 sm:p-8 bg-white shadow-xs hover:border-ink/20 transition-all">
          <h2 className="font-heading font-extrabold text-2xl text-ink tracking-tight mb-1">
            Personal Details
          </h2>
          <p className="text-sm font-medium text-ink/70 mb-6">
            Your identity and credentials authenticated through Google Sign-In.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2 p-2 bg-cream/70 rounded-2xl border border-ink/10 self-center sm:self-start">
              <Avatar
                src={page.avatarUrl || session.user.image}
                fallback={page.displayName || session.user.name || page.username}
                size="xl"
                className="ring-2 ring-white shadow-xs"
              />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-xs font-extrabold text-ink/70 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <div className="flex items-center justify-between px-4 py-3.5 bg-cream/80 border-2 border-ink/10 rounded-2xl text-ink font-bold text-base shadow-2xs">
                  <span>{session.user.name || "No name set"}</span>
                  <span className="text-xs font-semibold text-ink/40">Visible to visitors</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-ink/70 uppercase tracking-wider mb-1.5">
                  Google Email
                </label>
                <div className="flex items-center justify-between px-4 py-3.5 bg-cream/80 border-2 border-ink/10 rounded-2xl text-ink font-bold text-base shadow-2xs">
                  <span className="truncate">{session.user.email}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-forest bg-mint px-2.5 py-0.5 rounded-full border border-forest/20 shrink-0">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-ink/70 uppercase tracking-wider mb-1.5">
                  Unique Username
                </label>
                <div className="flex items-center justify-between px-4 py-3.5 bg-cream/80 border-2 border-ink/10 rounded-2xl text-ink font-bold text-base shadow-2xs">
                  <span className="font-mono text-forest">@{page.username}</span>
                  <span className="text-xs font-semibold text-ink/40">Claimed URL</span>
                </div>
                <p className="mt-2 text-xs text-ink/50 font-bold flex items-center gap-1.5 pl-1">
                  <Lock className="w-3 h-3 text-ink/40" />
                  Username changes are fixed for public consistency.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Public Page Live Link */}
        <Card className="border-2 border-ink/10 rounded-[32px] p-6 sm:p-8 bg-white shadow-xs hover:border-ink/20 transition-all">
          <h2 className="font-heading font-extrabold text-2xl text-ink tracking-tight mb-1">
            Public Page
          </h2>
          <p className="text-sm font-medium text-ink/70 mb-6">
            Share this link in your social bios, portfolio headers, and newsletters.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-2 sm:p-2.5 bg-cream/80 rounded-2xl sm:rounded-full border-2 border-ink/10 shadow-2xs">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-1">
              <div className="w-8 h-8 rounded-full bg-forest text-lime flex items-center justify-center shrink-0 shadow-2xs">
                <Globe className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-ink truncate select-all">
                {publicUrl}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CopyLinkButton username={page.username} variant="primary" />
              <a
                href={`/${page.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-bold rounded-full transition-all duration-150 cursor-pointer bg-white text-ink border border-hairline hover:bg-cream hover:border-ink/20 shadow-xs h-10 px-4 text-sm gap-1.5 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit</span>
              </a>
            </div>
          </div>
        </Card>

        {/* Card 3: Session & Security */}
        <Card className="border-2 border-ink/10 rounded-[32px] p-6 sm:p-8 bg-white shadow-xs hover:border-ink/20 transition-all">
          <h2 className="font-heading font-extrabold text-2xl text-ink tracking-tight mb-1">
            Session & Security
          </h2>
          <p className="text-sm font-medium text-ink/70 mb-6">
            You remain signed in on this device for 30 days of active use. Sign out whenever you leave a public or shared device.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <SignOutButton />
            <SignOutAllButton />
          </div>
        </Card>
      </div>
    </div>
  );
}
