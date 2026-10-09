import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-[24px] border border-ink/5 shadow-sm p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
