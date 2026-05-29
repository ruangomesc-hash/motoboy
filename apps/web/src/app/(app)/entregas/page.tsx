"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/components/app-data-provider";
import { formatBRL, formatTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AddDeliveryForm } from "@/components/add-delivery-form";
import { AddExpenseForm } from "@/components/add-expense-form";
import { isExpenseEntry } from "@motoboy/types";
import { formatSignedBRL } from "@/lib/utils";
import { AppPage } from "@/components/app-page";
import { isIsoOnDateInput, todayDateInputValue } from "@/lib/local-date";

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    IFOOD: "iFood",
    NINETY_NINE: "99",
    RAPPI: "Rappi",
    PARTICULAR: "Particular",
    OTHER: "Outro",
  };
  return map[source] ?? source;
}

export default function EntregasPage() {
  const {
    deliveries,
    deliveriesDate,
    setDeliveriesDate,
    syncDeliveriesFilterDate,
    isBootstrapped,
  } = useAppData();

  const deviceToday = todayDateInputValue();
  const filterDate = deliveriesDate || deviceToday;
  const isToday = filterDate === deviceToday;

  useEffect(() => {
    syncDeliveriesFilterDate();
  }, [syncDeliveriesFilterDate]);
  const visibleDeliveries = useMemo(
    () =>
      deliveries.filter((d) => isIsoOnDateInput(d.occurredAt, filterDate)),
    [deliveries, filterDate],
  );

  return (
    <AppPage className="p-3 space-y-3">
      <h1 className="text-lg font-bold px-1">Entregas</h1>

      <div className="space-y-2">
        <AddDeliveryForm />
        <AddExpenseForm />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground px-1">
          {isToday ? "Entregas de hoje" : "Entregas do dia"}
        </label>
        <Input
          type="date"
          value={filterDate}
          max={deviceToday}
          onChange={(e) => setDeliveriesDate(e.target.value)}
          className="h-10 text-sm"
        />
        {!isToday && (
          <button
            type="button"
            className="text-xs text-primary underline px-1"
            onClick={() => setDeliveriesDate(deviceToday)}
          >
            Voltar para hoje ({deviceToday.split("-").reverse().join("/")})
          </button>
        )}
      </div>

      {!isBootstrapped && visibleDeliveries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 animate-pulse">
          Carregando entregas...
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleDeliveries.map((d) => {
            const expense = isExpenseEntry(d.grossValue);
            return (
            <li key={d.id}>
              <Link
                href={`/entregas/${d.id}`}
                className={`block p-3 rounded-lg border bg-card active:bg-muted/50 ${
                  expense ? "border-red-500/30" : "border-border"
                }`}
              >
                <div className="flex justify-between gap-2 min-w-0">
                  <span
                    className={`font-semibold text-sm shrink-0 tabular-nums ${
                      expense ? "text-red-400" : ""
                    }`}
                  >
                    {formatSignedBRL(Number(d.grossValue))}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {formatTime(d.occurredAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-words">
                  {expense
                    ? `Despesa · ${d.originName ?? "Outro"}`
                    : (d.originName ?? sourceLabel(d.source))}
                  {!expense && d.distanceKm
                    ? ` · ${Number(d.distanceKm)} km`
                    : ""}
                </p>
              </Link>
            </li>
          );
          })}
          {visibleDeliveries.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">
              Nenhuma entrega neste dia. Registre acima ou pelo WhatsApp.
            </p>
          )}
        </ul>
      )}
    </AppPage>
  );
}
