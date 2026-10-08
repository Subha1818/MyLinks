import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "dark" | "light" | "forest";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "dark",
      size = "md",
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      dark: "bg-ink text-cream hover:bg-black focus-visible:ring-ink shadow-sm hover:shadow",
      light: "bg-white text-ink hover:bg-[#F0EEE6] border border-ink/15 focus-visible:ring-ink shadow-sm hover:shadow",
      forest: "bg-forest text-lime hover:bg-[#183d14] focus-visible:ring-forest shadow-sm hover:shadow",
    }[variant];

    const sizeStyles = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-2.5",
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
