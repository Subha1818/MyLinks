import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<
  HTMLDivElement,
  { className?: string; children: React.ReactNode; style?: React.CSSProperties }
>(({ className, children, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "bg-white rounded-[24px] border border-ink/5 shadow-sm p-6 sm:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";
