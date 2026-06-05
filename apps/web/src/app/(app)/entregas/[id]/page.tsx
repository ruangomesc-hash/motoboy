"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useDeleteDelivery } from "@/hooks/use-delete-delivery";
import { publishDeliverySync } from "@/lib/publish-delivery-sync";
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
import type { CreatedDelivery } from "@/lib/app-data-cache";
import {
  expenseLabelFromTag,
  guessExpenseTagId,
  isExpenseEntry,
  type ExpenseTagId,
} from "@motoboy/types";
import { ExpenseTagPicker } from "@/components/expense-tag-picker";

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
  const expense = isExpenseEntry(d.grossValue);
  return {
    grossValue: String(
      expense ? Math.abs(Number(d.grossValue)) : d.grossValue,
    ).replace(".", ","),
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

const AUTO_SAVE_MS = 700;

type SaveFormState = NonNullable<ReturnType<typeof toForm>>;

function buildPatchBody(
  delivery: DeliveryDetail,
  form: SaveFormState,
  expense: boolean,
  expenseOrigin: string | null,
  grossValue: number,
  distanceKm: number | null,
  occurredAt: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const storedGross = expense ? -Math.abs(grossValue) : grossValue;
  const nextOrigin = expense
    ? expenseOrigin ?? "Despesa"
    : form.originName.trim() || null;

  if (Number(delivery.grossValue) !== storedGross) {
    body.grossValue = grossValue;
  }
  if ((delivery.originName ?? null) !== nextOrigin) {
    body.originName = nextOrigin;
  }
  if (!expense) {
    const nextDistance = form.distanceKm.trim() ? distanceKm : null;
    const prevDistance =
      delivery.distanceKm == null || delivery.distanceKm === ""
        ? null
        : Number(delivery.distanceKm);
    if (prevDistance !== nextDistance) {
      body.distanceKm = nextDistance;
    }
    if (delivery.source !== form.source) {
      body.source = form.source;
    }
  }
  if (delivery.occurredAt !== occurredAt) {
    body.occurredAt = occurredAt;
  }
  return body;
}

export default function EntregaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const { deliveries, upsertDeliveryOptimistic, publishAppSync } = useAppData();
  const { deleteDelivery } = useDeleteDelivery();

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
  const [saveHint, setSaveHint] = useState<"idle" | "pending" | "saved">("idle");
  const [deleting, setDeleting] = useState(false);
  const formDirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expenseTagId, setExpenseTagId] = useState<ExpenseTagId>("almoco");
  const [expenseCustom, setExpenseCustom] = useState("");

  function syncExpenseTagsFromDetail(d: DeliveryDetail) {
    if (!isExpenseEntry(d.grossValue)) return;
    const tag = guessExpenseTagId(d.originName);
    setExpenseTagId(tag);
    setExpenseCustom(
      tag === "outro" ? (d.originName?.trim() ?? "") : "",
    );
  }

  useEffect(() => {
    if (!cached || delivery) return;
    const detail = cached as DeliveryDetail;
    setDelivery(detail);
    setForm(toForm(detail));
    syncExpenseTagsFromDetail(detail);
    setLoadingExtra(false);
  }, [cached, delivery]);

  useEffect(() => {
    let cancelled = false;
    void api<DeliveryDetail>(`/me/deliveries/${id}`)
      .then((d) => {
        if (cancelled) return;
        setDelivery((prev) => (prev ? { ...prev, ...d } : d));
        if (!formDirtyRef.current) {
          setForm(toForm(d));
          syncExpenseTagsFromDetail(d);
        }
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

  const persistDelivery = useCallback(
    async (opts?: { fromSubmit?: boolean }) => {
      if (!delivery || !form || saveInFlightRef.current) return false;

      const grossValue = parseDecimalInput(form.grossValue);
      if (grossValue == null || grossValue <= 0) {
        if (opts?.fromSubmit) setError("Informe um valor válido.");
        return false;
      }
      const distanceKm = form.distanceKm.trim()
        ? parseDecimalInput(form.distanceKm)
        : null;
      if (form.distanceKm.trim() && (distanceKm == null || distanceKm < 0)) {
        if (opts?.fromSubmit) setError("Km inválido.");
        return false;
      }

      const expense = isExpenseEntry(delivery.grossValue);
      if (expense && expenseTagId === "outro" && !expenseCustom.trim()) {
        if (opts?.fromSubmit) setError("Descreva a despesa em Outro");
        return false;
      }

      const expenseOrigin = expense
        ? expenseLabelFromTag(expenseTagId, expenseCustom)
        : null;
      const occurredAt = isoFromDatetimeLocal(form.occurredAtLocal);
      const patchBody = buildPatchBody(
        delivery,
        form,
        expense,
        expenseOrigin,
        grossValue,
        distanceKm,
        occurredAt,
      );

      if (Object.keys(patchBody).length === 0) {
        formDirtyRef.current = false;
        setSaveHint("idle");
        return true;
      }

      setSaving(true);
      saveInFlightRef.current = true;
      setError(null);
      const previous = delivery;
      const previousPayload = toPayload(previous);
      const storedGross = expense ? -Math.abs(grossValue) : grossValue;
      const optimistic: DeliveryDetail = {
        ...delivery,
        grossValue: storedGross,
        originName: expense
          ? expenseOrigin
          : form.originName.trim() || null,
        source: expense ? "OTHER" : form.source,
        distanceKm: expense ? null : distanceKm,
        occurredAt,
      };
      const optimisticPayload = toPayload(optimistic);
      setDelivery(optimistic);
      upsertDeliveryOptimistic(optimisticPayload, previousPayload);
      publishDeliverySync(publishAppSync, "optimistic", {
        delivery: optimisticPayload,
        previousDelivery: previousPayload,
      });

      try {
        const updated = await api<DeliveryDetail>(
          `/me/deliveries/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify(patchBody),
          },
          { skipSync: true },
        );

        setDelivery(updated);
        setForm(toForm(updated));
        syncExpenseTagsFromDetail(updated);
        formDirtyRef.current = false;
        const serverPayload = toPayload(updated);
        upsertDeliveryOptimistic(serverPayload, previousPayload);
        publishDeliverySync(publishAppSync, "confirmed", {
          delivery: serverPayload,
          previousDelivery: previousPayload,
        });
        setSaveHint("saved");
        window.setTimeout(() => setSaveHint("idle"), 2000);
        return true;
      } catch (err) {
        setDelivery(previous);
        upsertDeliveryOptimistic(previousPayload, optimisticPayload);
        publishDeliverySync(publishAppSync, "optimistic", {
          delivery: previousPayload,
          previousDelivery: optimisticPayload,
        });
        setError(
          err instanceof Error ? err.message : "Não foi possível salvar.",
        );
        setSaveHint("idle");
        return false;
      } finally {
        setSaving(false);
        saveInFlightRef.current = false;
      }
    },
    [
      api,
      delivery,
      expenseCustom,
      expenseTagId,
      form,
      id,
      publishAppSync,
      upsertDeliveryOptimistic,
    ],
  );

  useEffect(() => {
    if (!delivery || !form || loadingExtra || !formDirtyRef.current) return;
    setSaveHint("pending");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void persistDelivery();
    }, AUTO_SAVE_MS);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [delivery, form, expenseTagId, expenseCustom, loadingExtra, persistDelivery]);

  function markFormDirty() {
    formDirtyRef.current = true;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await persistDelivery({ fromSubmit: true });
  }

  function handleDelete() {
    if (!delivery || deleting) return;
    const snapshot = toPayload(delivery);
    setShowDeleteConfirm(false);
    void deleteDelivery(id, snapshot);
    router.replace("/entregas");
  }

  if (!delivery || !form) {
    return (
      <AppPage className="p-6 text-muted-foreground">
        {loadingExtra ? "Carregando..." : "Entrega não encontrada."}
      </AppPage>
    );
  }

  const expense = isExpenseEntry(delivery.grossValue);

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
        <h1 className="text-xl font-bold">
          {expense ? "Editar despesa" : "Editar entrega"}
        </h1>

        <form onSubmit={handleSave} className="space-y-3">
          <Field label="Valor (R$)">
            <Input
              inputMode="decimal"
              value={form.grossValue}
              onChange={(e) => {
                markFormDirty();
                setForm((f) =>
                  f
                    ? {
                        ...f,
                        grossValue: sanitizeDecimalInput(e.target.value),
                      }
                    : f,
                );
              }}
              required
            />
          </Field>

          {expense ? (
            <ExpenseTagPicker
              tagId={expenseTagId}
              custom={expenseCustom}
              onTagId={(tag) => {
                markFormDirty();
                setExpenseTagId(tag);
              }}
              onCustom={(value) => {
                markFormDirty();
                setExpenseCustom(value);
              }}
            />
          ) : (
            <Field label="Nome / local">
              <Input
                value={form.originName}
                onChange={(e) => {
                  markFormDirty();
                  setForm((f) =>
                    f ? { ...f, originName: e.target.value } : f,
                  );
                }}
                placeholder="Farmácia, mercado..."
              />
            </Field>
          )}

          {!expense && (
            <>
              <Field label="Km (opcional)">
                <Input
                  inputMode="decimal"
                  placeholder="3,5"
                  value={form.distanceKm}
                  onChange={(e) => {
                    markFormDirty();
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            distanceKm: sanitizeDecimalInput(e.target.value),
                          }
                        : f,
                    );
                  }}
                />
              </Field>

              <Field label="Origem (app)">
                <select
                  value={form.source}
                  onChange={(e) => {
                    markFormDirty();
                    setForm((f) => (f ? { ...f, source: e.target.value } : f));
                  }}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  {SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          <Field label="Data e hora">
            <p className="text-xs text-muted-foreground mb-1">
              {formatDateTimeLabel(isoFromDatetimeLocal(form.occurredAtLocal))}
            </p>
            <Input
              type="datetime-local"
              value={form.occurredAtLocal}
              onChange={(e) => {
                markFormDirty();
                setForm((f) =>
                  f ? { ...f, occurredAtLocal: e.target.value } : f,
                );
              }}
              className="text-base"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={saving || deleting}>
            {saving
              ? "Salvando..."
              : saveHint === "pending"
                ? "Salvando em instantes..."
                : saveHint === "saved"
                  ? "Salvo"
                  : "Salvar alterações"}
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
          {expense ? "Apagar despesa" : "Apagar entrega"}
        </Button>
      </AppPage>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={expense ? "Apagar despesa?" : "Apagar entrega?"}
        description={
          expense
            ? "Essa ação remove a despesa do dia, da lista e do histórico. Não dá para desfazer."
            : "Essa ação remove a entrega do dia, da lista e do histórico. Não dá para desfazer."
        }
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
