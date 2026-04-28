import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-[20px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-soft-raised active:shadow-soft-pressed",
      secondary: "bg-[var(--color-bg-base)] text-[var(--color-text-primary)] shadow-soft-raised hover:text-[var(--color-accent)] active:shadow-soft-pressed",
      outline: "border-2 border-[var(--color-text-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] bg-transparent",
      ghost: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
    };

    const sizes = {
      sm: "h-8 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
