import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

export function DatePicker({
  date,
  setDate,
  label,
  error
}: {
  date: string;
  setDate: (date: string) => void;
  label?: string;
  error?: string;
}) {
  let parsedDate: Date | undefined = undefined;
  if (date) {
    if (date.includes("/")) {
      parsedDate = parse(date, "MM/dd/yyyy", new Date());
    } else if (date.includes("-")) {
      parsedDate = parse(date, "yyyy-MM-dd", new Date());
    }
    if (parsedDate && !isValid(parsedDate)) {
        parsedDate = undefined;
    }
  }

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex w-full flex-col space-y-1">
      {label && (
        <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-[12px] bg-[var(--color-surface-inset)] px-4 py-2 text-base sm:text-sm shadow-soft-pressed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 border-none",
              !date ? "text-[var(--color-text-secondary)] opacity-80" : "text-[var(--color-text-primary)]",
              error && "ring-2 ring-red-500/50 focus-visible:ring-red-500"
            )}
          >
            {parsedDate ? format(parsedDate, "MM/dd/yyyy") : <span>Pick a date</span>}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-50 rounded-[16px] border border-gray-200 bg-white p-3 shadow-lg outline-none max-w-[calc(100vw-2rem)] overflow-x-auto" align="start" sideOffset={4}>
            <DayPicker
              mode="single"
              selected={parsedDate}
              onSelect={(d) => {
                if (d) setDate(format(d, "yyyy-MM-dd"));
                else setDate("");
                setIsOpen(false);
              }}
              style={{
                "--rdp-accent-color": "var(--color-accent)",
                "--rdp-background-color": "var(--color-accent)",
              } as React.CSSProperties}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
