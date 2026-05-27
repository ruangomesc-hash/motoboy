"use client";

import Link from "next/link";
import { useAppData } from "@/components/app-data-provider";
import { formatBRL, formatTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AddDeliveryForm } from "@/components/add-delivery-form";
import { AppPage } from "@/components/app-page";

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
    refreshDeliveries,
    isBootstrapped,
  } = useAppData();

  return (
    <AppPage className="p-3 space-y-3">
      <h1 className="text-lg font-bold px-1">Entregas</h1>

      <AddDeliveryForm onSuccess={() => void refreshDeliveries()} />

      <Input
        type="date"
        value={deliveriesDate}
        onChange={(e) => setDeliveriesDate(e.target.value)}
        className="h-10 text-sm"
      />

      {!isBootstrapped && deliveries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 animate-pulse">
          Carregando entregas...
        </p>
      ) : (
        <ul className="space-y-2">
          {deliveries.map((d) => (
            <li key={d.id}>
              <Link
                href={`/entregas/${d.id}`}
                className="block p-3 rounded-lg border border-border bg-card active:bg-muted/50"
              >
                <div className="flex justify-between gap-2 min-w-0">
                  <span className="font-semibold text-sm shrink-0 tabular-nums">
                    {formatBRL(Number(d.grossValue))}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {formatTime(d.occurredAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-words">
                  {d.originName ?? sourceLabel(d.source)}
                  {d.distanceKm ? ` · ${Number(d.distanceKm)} km` : ""}
                </p>
              </Link>
            </li>
          ))}
          {deliveries.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">
              Nenhuma entrega. Registre acima ou pelo WhatsApp.
            </p>
          )}
        </ul>
      )}
    </AppPage>
  );
}
