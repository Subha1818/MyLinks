export const instant = false;
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getPageByUserId } from "@/server/services/pages";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login | MyLinks",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    const page = await getPageByUserId(session.user.id);
    if (!page) {
      redirect("/onboarding");
    }
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="font-heading font-bold text-lg text-ink">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
