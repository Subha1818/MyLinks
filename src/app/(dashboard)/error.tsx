"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Card } from "@/components/dashboard/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <Card className="flex flex-col items-center justify-center text-center p-8 border-coral/20">
        <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-coral" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-ink mb-2">
          Something went wrong
        </h2>
        <p className="text-ink/70 font-medium mb-8 max-w-md">
          We encountered an unexpected error while loading this page. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-ink hover:bg-black text-cream font-bold py-3 px-6 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <RefreshCcw className="w-4 h-4" />
          Try again
        </button>
      </Card>
    </div>
  );
}
