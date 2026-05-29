"use client";

import {
  EXPENSE_TAGS,
  type ExpenseTagId,
} from "@motoboy/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ExpenseTagPicker({
  tagId,
  custom,
  onTagId,
  onCustom,
}: {
  tagId: ExpenseTagId;
  custom: string;
  onTagId: (id: ExpenseTagId) => void;
  onCustom: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Tipo</p>
      <div className="flex flex-wrap gap-2">
        {EXPENSE_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagId(tag.id)}
            className={cn(
              "rounded-full px-3 py-2 text-sm border min-h-[44px] touch-manipulation",
              tagId === tag.id
                ? "border-red-500 bg-red-500/15 text-red-300"
                : "border-border bg-muted/20 text-foreground",
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>
      {tagId === "outro" && (
        <div>
          <label className="text-xs text-muted-foreground">Descrição</label>
          <Input
            placeholder="Estacionamento, pneu..."
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            className="mt-1 text-base"
          />
        </div>
      )}
    </div>
  );
}
