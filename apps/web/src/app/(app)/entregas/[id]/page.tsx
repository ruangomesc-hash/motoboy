"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAppData } from "@/components/app-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  datetimeLocalFromIso,
  formatDateTimeLabel,
  isoFromDatetimeLocal,
} from "@/lib/local-date";
import {
  parseDecimalInput,
  sanitizeDecimalInput,
} from "@/lib/decimal-input";
import { AppPage } from "@/components/app-page";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { notifyAppSync } from "@/lib/app-sync";
import type { CreatedDelivery } from "@/lib/app-data-cache";

interface DeliveryDetail extends DeliveryListItem {
  destinationAddr?: string | null;
  proofPhotoUrl?: string | null;
  proofLat?: number | null;
  proofLng?: number | null;
}

const SOURCES = [
  { value: "PARTICULAR", label: "Particular" },
  { value: "IFOOD", label: "iFood" },
  { value: "NINETY_NINE", label: "99" },
  { value: "RAPPI", label: "Rappi" },
  { value: "OTHER", label: "Outro" },
] as const;

function toForm(d: DeliveryDetail) {
  return {
    grossValue: String(d.grossValue).replace(".", ","),
    originName: d.originName ?? "",
    source: d.source,
    distanceKm:
      d.distanceKm != null && d.distanceKm !== ""
        ? String(d.distanceKm).replace(".", ",")
        : "",
    occurredAtLocal: datetimeLocalFromIso(d.occurredAt),
  };
}

function toPayload(d: DeliveryDetail): CreatedDelivery {
  return {
    id: d.id,
    grossValue: d.grossValue,
    source: d.source,
    originName: d.originName ?? null,
    occurredAt: d.occurredAt,
    distanceKm: d.distanceKm ?? null,
  };
}

export default function EntregaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const {
    deliveries,
    removeDeliveryOptimistic,
    upsertDeliveryOptimistic,
  } = useAppData();

  const cached = useMemo(
    () => deliveries.find((d) => d.id === id) ?? null,
    [deliveries, id],
  );

  const [delivery, setDelivery] = useState<DeliveryDetail | null>(
    cached as DeliveryDetail | null,
  );
  const [form, setForm] = useState(() =>
    cached ? toForm(cached as DeliveryDetail) : null,
  );
  const [loadingExtra, setLoadingExtra] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cached || delivery) return;
    setDelivery(cached as DeliveryDetail);
    setForm(toForm(cached as DeliveryDetail));
    setLoadingExtra(false);
  }, [cached, delivery]);

  useEffect(() => {
    let cancelled = false;
    void api<DeliveryDetail>(`/me/deliveries/${id}`)
      .then((d) => {
        if (cancelled) return;
        setDelivery(d);
        setForm(toForm(d));
      })
      .catch(() => {
        if (!cancelled && !cached) setDelivery(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingExtra(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api, id, cached]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!delivery || !form) return;

    const grossValue = parseDecimalInput(form.grossValue);
    if (grossValue == null || grossValue <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    const distanceKm = form.distanceKm.trim()
      ? parseDecimalInput(form.distanceKm)
      : null;
    if (form.distanceKm.trim() && (distanceKm == null || distanceKm < 0)) {
      setError("Km inválido.");
      return;
    }

    setSaving(true);
    setError(null);
    const previous = delivery;
    const previousPayload = toPayload(previous);
    const optimistic: DeliveryDetail = {
      ...delivery,
      grossValue,
      originName: form.originName.trim() || null,
      source: form.source,
      distanceKm,
      occurredAt: isoFromDatetimeLocal(form.occurredAtLocal),
    };
    const optimisticPayload = toPayload(optimistic);
    setDelivery(optimistic);
    upsertDeliveryOptimistic(optimisticPayload, previousPayload);
    notifyAppSync(["deliveries", "today", "stats"], {
      delivery: optimisticPayload,
      previousDelivery: previousPayload,
      skipReconcile: true,
    });
    try {
      const updated = await api<DeliveryDetail>(
        `/me/deliveries/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            grossValue,
            originName: form.originName.trim() || null,
            source: form.source,
            distanceKm,
            occurredAt: optimistic.occurredAt,
          }),
        },
        { skipSync: true },
      );

      setDelivery(updated);
      setForm(toForm(updated));
      const serverPayload = toPayload(updated);
      upsertDeliveryOptimistic(serverPayload, previousPayload);
      notifyAppSync(["deliveries", "today", "stats"], {
        delivery: serverPayload,
        previousDelivery: previousPayload,
        skipReconcile: true,
      });
    } catch (err) {
      setDelivery(previous);
      upsertDeliveryOptimistic(previousPayload, optimisticPayload);
      notifyAppSync(["deliveries", "today", "stats"], {
        delivery: previousPayload,
        previousDelivery: optimisticPayload,
        skipReconcile: true,
      });
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delivery || deleting) return;
    setDeleting(true);
    setDeleteError(null);

    const snapshot = toPayload(delivery);

    try {
      await api(`/me/deliveries/${id}`, { method: "DELETE" }, { skipSync: true });
      removeDeliveryOptimistic(id, snapshot);
      notifyAppSync(["deliveries", "today", "stats"], {
        removedDeliveryId: id,
        skipReconcile: true,
      });
      setShowDeleteConfirm(false);
      router.replace("/entregas");
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível apagar. Tente de novo.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (!delivery || !form) {
    return (
      <AppPage className="p-6 text-muted-foreground">
        {loadingExtra ? "Carregando..." : "Entrega não encontrada."}
      </AppPage>
    );
  }

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const staticMap =
    delivery.proofLat &&
    delivery.proofLng &&
    mapsKey
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${delivery.proofLat},${delivery.proofLng}&zoom=15&size=400x200&markers=color:green%7C${delivery.proofLat},${delivery.proofLng}&key=${mapsKey}`
      : null;

  return (
    <>
      <AppPage className="p-4 space-y-4 pb-8">
        <h1 className="text-xl font-bold">Editar entrega</h1>

        <form onSubmit={handleSave} className="space-y-3">
          <Field label="Valor (R$)">
            <Input
              inputMode="decimal"
              value={form.grossValue}
              onChange={(e) =>
                setForm((f) =>
                  f
                    ? {
                        ...f,
                        grossValue: sanitizeDecimalInput(e.target.value),
                      }
                    : f,
                )
              }
              required
            />
          </Field>

          <Field label="Nome / local">
            <Input
              value={form.originName}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, originName: e.target.value } : f))
              }
              placeholder="Farmácia, mercado..."
            />
          </Field>

          <Field label="Km (opcional)">
            <Input
              inputMode="decimal"
              placeholder="3,5"
              value={form.distanceKm}
              onChange={(e) =>
                setForm((f) =>
                  f
                    ? {
                        ...f,
                        distanceKm: sanitizeDecimalInput(e.target.value),
                      }
                    : f,
                )
              }
            />
          </Field>

          <Field label="Origem (app)">
            <select
              value={form.source}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, source: e.target.value } : f))
              }
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Data e hora">
            <p className="text-xs text-muted-foreground mb-1">
              {formatDateTimeLabel(isoFromDatetimeLocal(form.occurredAtLocal))}
            </p>
            <Input
              type="datetime-local"
              value={form.occurredAtLocal}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, occurredAtLocal: e.target.value } : f,
                )
              }
              className="h-10 text-sm"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={saving || deleting}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>

        {delivery.destinationAddr && (
          <p className="text-sm text-muted-foreground break-words">
            {delivery.destinationAddr}
          </p>
        )}
        {delivery.proofPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={delivery.proofPhotoUrl}
            alt="Prova de entrega"
            className="rounded-lg w-full"
          />
        )}
        {staticMap && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={staticMap} alt="Mapa" className="rounded-lg w-full" />
        )}

        <Button
          variant="outline"
          className="w-full text-destructive"
          disabled={saving || deleting}
          onClick={() => {
            setDeleteError(null);
            setShowDeleteConfirm(true);
          }}
        >
          Apagar entrega
        </Button>
      </AppPage>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Apagar entrega?"
        description="Essa ação remove a entrega do dia, da lista e do histórico. Não dá para desfazer."
        confirmLabel="Apagar"
        loading={deleting}
        error={deleteError}
        onCancel={() => {
          if (deleting) return;
          setShowDeleteConfirm(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
