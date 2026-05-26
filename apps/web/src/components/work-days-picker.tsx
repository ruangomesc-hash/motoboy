"use client";

import { cn } from "@/lib/utils";
import { DEFAULT_WORK_DAYS, WEEKDAY_OPTIONS } from "@/lib/work-days";

export function WorkDaysPicker({
  value,
  onChange,
}: {
  value?: number[];
  onChange: (days: number[]) => void;
}) {
  const days = value?.length ? value : [...DEFAULT_WORK_DAYS];

  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAY_OPTIONS.map((day) => {
        const active = days.includes(day.id);
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => {
              const next = active
                ? days.filter((d) => d !== day.id)
                : [...days, day.id].sort((a, b) => a - b);
              if (next.length > 0) onChange(next);
            }}
            className={cn(
              "h-9 min-w-[2.75rem] px-2 rounded-full text-xs font-medium border transition-colors",
              active
                ? "bg-primary/15 border-primary text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
