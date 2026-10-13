import { Metadata } from "next";
import { AuthBackground } from "@/components/brand/AuthBackground";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-cream overflow-x-hidden flex flex-col items-center justify-center p-4">
      <AuthBackground />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
