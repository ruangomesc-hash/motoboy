"use client";

import { motion } from "framer-motion";
import { formatBRL } from "@/lib/utils";

export function LucroCard({ value }: { value: number }) {
  const positive = value >= 0;
  const colorClass = positive ? "text-green-500" : "text-red-500";

  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center w-full max-w-full min-w-0 overflow-hidden">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
        Lucro líquido hoje
      </p>
      <motion.p
        key={value}
        initial={{ scale: 1.05, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`text-2xl sm:text-3xl font-bold tabular-nums leading-tight break-words ${colorClass}`}
      >
        {formatBRL(value)}
      </motion.p>
    </div>
  );
}
