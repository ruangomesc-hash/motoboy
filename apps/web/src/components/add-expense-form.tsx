"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseTagPicker } from "@/components/expense-tag-picker";
import { useCreateExpense } from "@/hooks/use-create-expense";
import {
  datetimeLocalFromIso,
  formatDateTimeLabel,
  isoFromDatetimeLocal,
} from "@/lib/local-date";
import { sanitizeDecimalInput } from "@/lib/decimal-input";
import {
  expenseLabelFromTag,
  type ExpenseTagId,
} from "@motoboy/types";
import { Minus, X } from "lucide-react";

export function AddExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const { createExpense } = useCreateExpense();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editDateTime, setEditDateTime] = useState(false);
  const [occurredAtLocal, setOccurredAtLocal] = useState(() =>
    datetimeLocalFromIso(new Date().toISOString()),
  );
  const [tagId, setTagId] = useState<ExpenseTagId>("almoco");
  const [customLabel, setCustomLabel] = useState("");
  const [grossValue, setGrossValue] = useState("");

  function resetForm() {
    setGrossValue("");
    setTagId("almoco");
    setCustomLabel("");
    setEditDateTime(false);
    setOccurredAtLocal(datetimeLocalFromIso(new Date().toISOString()));
    setError("");
  }

  const previewIso = editDateTime
    ? isoFromDatetimeLocal(occurredAtLocal)
    : new Date().toISOString();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(grossValue.replace(",", "."));
    if (!value || value <= 0) {
      setError("Informe o valor da despesa");
      return;
    }
    if (tagId === "outro" && !customLabel.trim()) {
      setError("Descreva a despesa em Outro");
      return;
    }

    const occurredAt = editDateTime
      ? isoFromDatetimeLocal(occurredAtLocal)
      : new Date().toISOString();

    const originName = expenseLabelFromTag(tagId, customLabel);

    const payload = {
      grossValue: value,
      originName,
      occurredAt,
    };

    setLoading(true);
    setError("");
    setOpen(false);
    onSuccess?.();

    const result = await createExpense(payload);

    setLoading(false);

    if (result.ok) {
      resetForm();
      return;
    }

    setError(result.error);
    setGrossValue(String(payload.grossValue).replace(".", ","));
    setTagId(tagId);
    setCustomLabel(customLabel);
    setOccurredAtLocal(datetimeLocalFromIso(payload.occurredAt));
    setEditDateTime(true);
    setOpen(true);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
        onClick={() => setOpen(true)}
      >
        <Minus className="h-4 w-4" />
        Registrar despesa
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-red-500/30 bg-card p-4 space-y-3 w-full max-w-full min-w-0"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Nova despesa</h2>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            resetForm();
          }}
          className="text-muted-foreground p-1"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg bg-muted/30 p-3 space-y-2">
        <p className="text-xs text-muted-foreground">Data e hora</p>
        <p className="text-sm font-medium">{formatDateTimeLabel(previewIso)}</p>
        {!editDateTime ? (
          <button
            type="button"
            className="text-xs text-primary underline"
            onClick={() => setEditDateTime(true)}
          >
            Alterar data
          </button>
        ) : (
          <div className="space-y-2">
            <Input
              type="datetime-local"
              value={occurredAtLocal}
              onChange={(e) => setOccurredAtLocal(e.target.value)}
              className="text-base"
            />
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => {
                setEditDateTime(false);
                setOccurredAtLocal(datetimeLocalFromIso(new Date().toISOString()));
              }}
            >
              Usar data e hora de agora
            </button>
          </div>
        )}
      </div>

      <ExpenseTagPicker
        tagId={tagId}
        custom={customLabel}
        onTagId={setTagId}
        onCustom={setCustomLabel}
      />

      <div>
        <label className="text-xs text-muted-foreground">Valor (R$)</label>
        <Input
          inputMode="decimal"
          placeholder="15,00"
          value={grossValue}
          onChange={(e) =>
            setGrossValue(sanitizeDecimalInput(e.target.value))
          }
          className="mt-1 text-base"
          required
          autoFocus
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar despesa"}
      </Button>
    </form>
  );
}
