import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "bg-white rounded-[28px] border border-hairline shadow-xs p-6 sm:p-8 transition-all duration-150",
          interactive &&
            "cursor-pointer hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
