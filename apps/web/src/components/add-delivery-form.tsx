"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { Plus, X } from "lucide-react";

const SOURCES = [
  { value: "PARTICULAR", label: "Particular" },
  { value: "IFOOD", label: "iFood" },
  { value: "NINETY_NINE", label: "99" },
  { value: "RAPPI", label: "Rappi" },
  { value: "OTHER", label: "Outro" },
] as const;

export function AddDeliveryForm({ onSuccess }: { onSuccess: () => void }) {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    grossValue: "",
    source: "PARTICULAR",
    originName: "",
    distanceKm: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(form.grossValue.replace(",", "."));
    if (!value || value <= 0) {
      setError("Informe o valor da entrega");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api("/me/deliveries", {
        method: "POST",
        body: JSON.stringify({
          grossValue: value,
          source: form.source,
          originName: form.originName.trim() || null,
          distanceKm: form.distanceKm
            ? Number(form.distanceKm.replace(",", "."))
            : null,
        }),
      });
      setForm({
        grossValue: "",
        source: "PARTICULAR",
        originName: "",
        distanceKm: "",
      });
      setOpen(false);
      onSuccess();
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
    } finally {
      setLoading(false);
    }
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
      className="rounded-xl border border-emerald-500/30 bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Nova entrega</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted-foreground p-1"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Valor (R$)</label>
        <Input
          inputMode="decimal"
          placeholder="25,00"
          value={form.grossValue}
          onChange={(e) =>
            setForm((f) => ({ ...f, grossValue: e.target.value }))
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
            setForm((f) => ({ ...f, distanceKm: e.target.value }))
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
