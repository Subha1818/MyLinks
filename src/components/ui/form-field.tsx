import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  const describedBy = [
    error ? `${id}-error` : null,
    hint ? `${id}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-bold text-ink/70">
        {label}
      </label>
      
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>, {
              id,
              "aria-invalid": !!error,
              ...(describedBy ? { "aria-describedby": describedBy } : {}),
            });
          }
          return child;
        })}
      </div>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-ink/60 font-medium">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-coral font-medium"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
