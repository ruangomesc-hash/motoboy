"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDelivery } from "@/hooks/use-create-delivery";
import {
  datetimeLocalFromIso,
  formatDateTimeLabel,
  isoFromDatetimeLocal,
} from "@/lib/local-date";
import { sanitizeDecimalInput } from "@/lib/decimal-input";
import { Plus, X } from "lucide-react";

const SOURCES = [
  { value: "PARTICULAR", label: "Particular" },
  { value: "IFOOD", label: "iFood" },
  { value: "NINETY_NINE", label: "99" },
  { value: "RAPPI", label: "Rappi" },
  { value: "OTHER", label: "Outro" },
] as const;

export function AddDeliveryForm({ onSuccess }: { onSuccess?: () => void }) {
  const { createDelivery } = useCreateDelivery();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editDateTime, setEditDateTime] = useState(false);
  const [occurredAtLocal, setOccurredAtLocal] = useState(() =>
    datetimeLocalFromIso(new Date().toISOString()),
  );
  const [form, setForm] = useState({
    grossValue: "",
    source: "PARTICULAR",
    originName: "",
    distanceKm: "",
  });

  function resetForm() {
    setForm({
      grossValue: "",
      source: "PARTICULAR",
      originName: "",
      distanceKm: "",
    });
    setEditDateTime(false);
    setOccurredAtLocal(datetimeLocalFromIso(new Date().toISOString()));
    setError("");
  }

  const previewIso = editDateTime
    ? isoFromDatetimeLocal(occurredAtLocal)
    : new Date().toISOString();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(form.grossValue.replace(",", "."));
    if (!value || value <= 0) {
      setError("Informe o valor da entrega");
      return;
    }
    const parsedDistanceKm = form.distanceKm
      ? Number(form.distanceKm.replace(",", "."))
      : null;
    if (
      parsedDistanceKm != null &&
      (!Number.isFinite(parsedDistanceKm) || parsedDistanceKm < 0)
    ) {
      setError("Km inválido. Use apenas números e ponto/vírgula.");
      return;
    }

    const occurredAt = editDateTime
      ? isoFromDatetimeLocal(occurredAtLocal)
      : new Date().toISOString();

    const payload = {
      grossValue: value,
      source: form.source,
      originName: form.originName.trim() || null,
      distanceKm: parsedDistanceKm,
      occurredAt,
    };

    setLoading(true);
    setError("");
    setOpen(false);
    onSuccess?.();

    const result = await createDelivery(payload);

    setLoading(false);

    if (result.ok) {
      resetForm();
      return;
    }

    setError(result.error);
    setForm({
      grossValue: String(payload.grossValue).replace(".", ","),
      source: payload.source,
      originName: payload.originName ?? "",
      distanceKm:
        payload.distanceKm != null ? String(payload.distanceKm).replace(".", ",") : "",
    });
    setOccurredAtLocal(datetimeLocalFromIso(payload.occurredAt));
    setEditDateTime(true);
    setOpen(true);
  }

  if (!open) {
    return (
      <Button
        type="button"
        className="w-full h-11 gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Registrar entrega
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-emerald-500/30 bg-card p-4 space-y-3 w-full max-w-full min-w-0"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Nova entrega</h2>
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
        <p className="text-xs text-muted-foreground">Data e hora da entrega</p>
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
              className="h-10 text-sm"
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

      <div>
        <label className="text-xs text-muted-foreground">Valor (R$)</label>
        <Input
          inputMode="decimal"
          placeholder="25,00"
          value={form.grossValue}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              grossValue: sanitizeDecimalInput(e.target.value),
            }))
          }
          className="mt-1"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Origem</label>
        <select
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          className="mt-1 flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">
          Nome / local (opcional)
        </label>
        <Input
          placeholder="Farmácia ABC"
          value={form.originName}
          onChange={(e) =>
            setForm((f) => ({ ...f, originName: e.target.value }))
          }
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Km (opcional)</label>
        <Input
          inputMode="decimal"
          placeholder="3,5"
          value={form.distanceKm}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              distanceKm: sanitizeDecimalInput(e.target.value),
            }))
          }
          className="mt-1"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : "Salvar entrega"}
      </Button>
    </form>
  );
}
