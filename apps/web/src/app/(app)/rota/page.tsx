"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppPage } from "@/components/app-page";
import { validateRouteAddressInput } from "@/lib/route-address";

type RouteResult = {
  orderedAddresses: string[];
  totalKm: number;
  totalMin: number;
  googleMapsUrl: string;
  wazeUrl: string;
  source: "google";
};

type RouteErrorBody = {
  error?: string;
  code?: string;
  details?: string[];
};

export default function RotaPage() {
  const api = useApi();
  const [addresses, setAddresses] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

  function updateAddress(i: number, value: string) {
    setAddresses((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[i];
      return next;
    });
    setError(null);
  }

  function addAddress() {
    setAddresses((prev) => [...prev, ""]);
  }

  async function optimize() {
    const filtered = addresses.map((a) => a.trim()).filter(Boolean);
    if (filtered.length < 2) {
      setError("Informe pelo menos 2 endereços.");
      return;
    }

    const nextFieldErrors: Record<number, string> = {};
    addresses.forEach((addr, i) => {
      const trimmed = addr.trim();
      if (!trimmed) return;
      const msg = validateRouteAddressInput(trimmed);
      if (msg) nextFieldErrors[i] = msg;
    });
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Corrija os endereços destacados antes de otimizar.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api<RouteResult>("/me/routes/optimize", {
        method: "POST",
        body: JSON.stringify({ addresses: filtered }),
      });
      setResult(data);
    } catch (err) {
      const e = err as Error & { status?: number };
      let message = e.message || "Não foi possível otimizar a rota.";
      try {
        const parsed = JSON.parse(message) as RouteErrorBody;
        if (parsed.error) message = parsed.error;
        if (parsed.details?.length) {
          message = `${message}\n${parsed.details.join("\n")}`;
        }
      } catch {
        /* message já é texto */
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppPage className="p-4 space-y-4 pb-8">
      <h1 className="text-xl font-bold">Roteirizador</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Usa <strong className="text-foreground">Google Maps</strong> (Geocoding +
        Directions) para validar endereços e calcular km/tempo reais. O botão Waze
        abre o primeiro ponto; rotas com várias paradas use o Google Maps.
      </p>

      {addresses.map((addr, i) => (
        <div key={i} className="space-y-1">
          <Input
            placeholder={`Endereço ${i + 1} — ex.: Rua X, 100, São Paulo`}
            value={addr}
            onChange={(e) => updateAddress(i, e.target.value)}
            className={fieldErrors[i] ? "border-destructive" : undefined}
          />
          {fieldErrors[i] && (
            <p className="text-xs text-destructive">{fieldErrors[i]}</p>
          )}
        </div>
      ))}

      <Button variant="outline" onClick={addAddress} className="w-full">
        + Endereço
      </Button>

      {error && (
        <p className="text-sm text-destructive whitespace-pre-line rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {error}
        </p>
      )}

      <Button onClick={optimize} disabled={loading} className="w-full" size="lg">
        {loading ? "Validando e otimizando..." : "Otimizar rota"}
      </Button>

      {result && (
        <div className="space-y-3 p-4 rounded-lg border border-emerald-500/30 bg-card">
          <p className="text-xs text-emerald-400/90">Rota via Google Maps</p>
          <p className="text-sm text-muted-foreground">
            {result.totalKm.toFixed(1)} km · ~{result.totalMin} min
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1 break-words">
            {result.orderedAddresses.map((a, idx) => (
              <li key={`${idx}-${a}`} className="break-words pr-1">
                {a}
              </li>
            ))}
          </ol>
          <Button asChild className="w-full">
            <a
              href={result.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir no Google Maps
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={result.wazeUrl} target="_blank" rel="noopener noreferrer">
              Abrir 1º ponto no Waze
            </a>
          </Button>
        </div>
      )}
    </AppPage>
  );
}
