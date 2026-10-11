import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-[16px] border border-hairline bg-cream px-4 py-3 text-[15px] sm:text-base text-ink font-medium placeholder:text-ink/40 transition-all",
          "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1 focus-visible:border-forest",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error &&
            "border-tomato focus-visible:ring-tomato focus-visible:border-tomato text-tomato",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
