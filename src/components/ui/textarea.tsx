import { cn } from "@/lib/utils";
import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
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
Textarea.displayName = "Textarea";
