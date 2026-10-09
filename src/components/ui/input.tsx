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
          "flex w-full rounded-xl border border-ink/10 bg-cream px-4 py-3 text-sm text-ink font-medium placeholder:text-ink/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:border-transparent transition-all",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-coral focus-visible:ring-coral",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
