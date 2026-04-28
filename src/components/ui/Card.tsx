import { cn } from "../../lib/utils";

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
        "rounded-[24px] bg-[var(--color-bg-base)] p-6 md:p-8 shadow-soft-raised",
        className
      )}
    >
      {children}
    </div>
  );
}
