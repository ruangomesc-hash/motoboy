"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { formatBRL, formatTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AddDeliveryForm } from "@/components/add-delivery-form";

interface Delivery {
  id: string;
  grossValue: string | number;
  originName: string | null;
  source: string;
  occurredAt: string;
  distanceKm?: string | number | null;
}

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
  const api = useApi();
  const [items, setItems] = useState<Delivery[]>([]);
  const [date, setDate] = useState("");

  const load = useCallback(() => {
    const q = date ? `?date=${date}` : "";
    api<{ items: Delivery[] }>(`/me/deliveries${q}`)
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));
  }, [api, date]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-3 space-y-3">
      <h1 className="text-lg font-bold px-1">Entregas</h1>

      <AddDeliveryForm onSuccess={load} />

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-10 text-sm"
      />

      <ul className="space-y-2">
        {items.map((d) => (
          <li key={d.id}>
            <Link
              href={`/entregas/${d.id}`}
              className="block p-3 rounded-lg border border-border bg-card active:bg-muted/50"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-sm">
                  {formatBRL(Number(d.grossValue))}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatTime(d.occurredAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {d.originName ?? sourceLabel(d.source)}
                {d.distanceKm ? ` · ${Number(d.distanceKm)} km` : ""}
              </p>
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">
            Nenhuma entrega. Registre acima ou pelo WhatsApp.
          </p>
        )}
      </ul>
    </div>
  );
}
