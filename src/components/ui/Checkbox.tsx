import { InputProps } from "./Input";
import { cn } from "../../lib/utils";

export function Checkbox({ className, label, ...props }: Omit<InputProps, "type">) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className={cn(
          "w-6 h-6 rounded bg-[var(--color-surface-inset)] shadow-soft-pressed border-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)] peer-checked:bg-[var(--color-accent)] peer-checked:shadow-soft-raised transition-all",
          className
        )} />
        <svg
          className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      {label && <span className="text-sm text-[var(--color-text-primary)] font-medium">{label}</span>}
    </label>
  );
}
