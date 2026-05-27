"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppPage } from "@/components/app-page";

export default function RotaPage() {
  const api = useApi();
  const [addresses, setAddresses] = useState<string[]>([""]);
  const [result, setResult] = useState<{
    orderedAddresses: string[];
    totalKm: number;
    totalMin: number;
    googleMapsUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function updateAddress(i: number, value: string) {
    setAddresses((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function addAddress() {
    setAddresses((prev) => [...prev, ""]);
  }

  async function optimize() {
    const filtered = addresses.map((a) => a.trim()).filter(Boolean);
    if (filtered.length < 2) return;
    setLoading(true);
    try {
      const data = await api<typeof result>("/me/routes/optimize", {
        method: "POST",
        body: JSON.stringify({ addresses: filtered }),
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppPage className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Roteirizador</h1>
      <p className="text-sm text-muted-foreground">
        Cole os endereços ou mande a lista no WhatsApp.
      </p>
      {addresses.map((addr, i) => (
        <Input
          key={i}
          placeholder={`Endereço ${i + 1}`}
          value={addr}
          onChange={(e) => updateAddress(i, e.target.value)}
        />
      ))}
      <Button variant="outline" onClick={addAddress} className="w-full">
        + Endereço
      </Button>
      <Button onClick={optimize} disabled={loading} className="w-full" size="lg">
        {loading ? "Otimizando..." : "Otimizar rota"}
      </Button>
      {result && (
        <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            {result.totalKm.toFixed(1)} km · ~{result.totalMin} min
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1 break-words">
            {result.orderedAddresses.map((a) => (
              <li key={a} className="break-words pr-1">
                {a}
              </li>
            ))}
          </ol>
          <Button asChild className="w-full">
            <a href={result.googleMapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir no Google Maps
            </a>
          </Button>
        </div>
      )}
    </AppPage>
  );
}
