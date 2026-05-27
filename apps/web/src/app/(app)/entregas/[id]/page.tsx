"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { formatBRL, formatTime } from "@/lib/utils";
import { AppPage } from "@/components/app-page";

interface DeliveryDetail {
  id: string;
  grossValue: string | number;
  originName: string | null;
  source: string;
  occurredAt: string;
  destinationAddr: string | null;
  proofPhotoUrl: string | null;
  proofLat: number | null;
  proofLng: number | null;
  distanceKm?: string | number | null;
}

export default function EntregaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);

  useEffect(() => {
    api<DeliveryDetail>(`/me/deliveries/${id}`)
      .then(setDelivery)
      .catch(() => setDelivery(null));
  }, [api, id]);

  async function handleDelete() {
    if (!confirm("Apagar esta entrega?")) return;
    await api(`/me/deliveries/${id}`, { method: "DELETE" });
    router.push("/entregas");
  }

  if (!delivery) {
    return <div className="p-6 text-muted-foreground">Carregando...</div>;
  }

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const staticMap =
    delivery.proofLat &&
    delivery.proofLng &&
    mapsKey
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${delivery.proofLat},${delivery.proofLng}&zoom=15&size=400x200&markers=color:green%7C${delivery.proofLat},${delivery.proofLng}&key=${mapsKey}`
      : null;

  return (
    <AppPage className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{formatBRL(Number(delivery.grossValue))}</h1>
      <p className="text-muted-foreground">
        {delivery.originName ?? delivery.source} · {formatTime(delivery.occurredAt)}
      </p>
      {delivery.destinationAddr && (
        <p className="text-sm break-words">{delivery.destinationAddr}</p>
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
      <Button variant="outline" className="w-full text-destructive" onClick={handleDelete}>
        Apagar entrega
      </Button>
    </AppPage>
  );
}
