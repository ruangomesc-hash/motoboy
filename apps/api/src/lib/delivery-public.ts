import type { Delivery } from "@motoboy/db";

/** Resposta segura da API — sem rawInput (payload WhatsApp/IA) nem userId. */
export type PublicDelivery = {
  id: string;
  source: Delivery["source"];
  grossValue: number;
  distanceKm: number | null;
  durationMin: number | null;
  originName: string | null;
  destinationAddr: string | null;
  destinationLat: number | null;
  destinationLng: number | null;
  proofPhotoUrl: string | null;
  proofLat: number | null;
  proofLng: number | null;
  proofAt: string | null;
  occurredAt: string;
  parsedAt: string;
};

function safeIso(d: Date | null | undefined): string | null {
  if (!d || Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function toPublicDelivery(row: Delivery): PublicDelivery {
  return {
    id: row.id,
    source: row.source,
    grossValue: Number(row.grossValue),
    distanceKm: row.distanceKm != null ? Number(row.distanceKm) : null,
    durationMin: row.durationMin,
    originName: row.originName,
    destinationAddr: row.destinationAddr,
    destinationLat: row.destinationLat,
    destinationLng: row.destinationLng,
    proofPhotoUrl: row.proofPhotoUrl,
    proofLat: row.proofLat,
    proofLng: row.proofLng,
    proofAt: safeIso(row.proofAt),
    occurredAt: safeIso(row.occurredAt) ?? new Date().toISOString(),
    parsedAt: safeIso(row.parsedAt) ?? new Date().toISOString(),
  };
}

export function toPublicDeliveries(rows: Delivery[]): PublicDelivery[] {
  return rows.map(toPublicDelivery);
}
