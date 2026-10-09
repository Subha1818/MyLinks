import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-forest animate-spin mb-4" />
      <p className="text-ink/60 font-bold text-lg animate-pulse">
        Loading...
      </p>
    </div>
  );
}
