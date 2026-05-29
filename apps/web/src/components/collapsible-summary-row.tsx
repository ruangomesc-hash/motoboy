"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSummarySection({
  title,
  summary,
  summaryTone = "neutral",
  children,
  defaultOpen = false,
}: {
  title: string;
  summary?: string;
  summaryTone?: "positive" | "negative" | "neutral";
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const summaryClass =
    summaryTone === "positive"
      ? "text-green-500"
      : summaryTone === "negative"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full max-w-full min-w-0 flex items-center gap-1 min-h-[44px] py-2 px-1.5 text-left active:opacity-80"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
        />
        <span className="flex-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {summary != null && (
          <span
            className={cn(
              "text-xs font-semibold tabular-nums shrink-0",
              summaryClass,
            )}
          >
            {summary}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CollapsibleSummaryRow({
  Icon,
  label,
  value,
  valueTone = "neutral",
  details,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  valueTone?: "positive" | "negative" | "neutral";
  details?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const expandable = details != null;

  const toneClass =
    valueTone === "positive"
      ? "text-green-500"
      : valueTone === "negative"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        type="button"
        disabled={!expandable}
        onClick={() => expandable && setOpen((o) => !o)}
        className={cn(
          "w-full max-w-full min-w-0 flex items-center gap-2 min-h-[44px] py-2 px-0.5 text-left text-sm",
          expandable && "active:opacity-80",
          !expandable && "cursor-default",
        )}
      >
        <Icon
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="flex-1 min-w-0 truncate">{label}</span>
        <span
          className={cn(
            "font-semibold tabular-nums shrink-0 max-w-[46%] truncate text-right text-xs sm:text-sm",
            toneClass,
          )}
        >
          {value}
        </span>
        {expandable && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            strokeWidth={1.75}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-2 pl-7 pr-1 text-xs text-muted-foreground space-y-1 leading-relaxed">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
