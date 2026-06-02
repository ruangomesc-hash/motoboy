import type { DeliverySource } from "@motoboy/types";
import type { ExtractionResult } from "@motoboy/types";

/** Extrai entrega de texto informal antes da IA (evita R$ 25 / PARTICULAR fixos). */
export function tryParseDeliveryFromText(
  text: string,
): Extract<ExtractionResult, { type: "delivery" }> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const grossValue = parseMoneyAmount(lower);
  if (grossValue == null) return null;

  if (!looksLikeDeliveryRegistration(lower)) return null;

  return {
    type: "delivery",
    source: parseDeliverySource(lower),
    grossValue,
    originName: null,
    destinationAddr: null,
    distanceKm: null,
    confidence: 0.92,
  };
}

function looksLikeDeliveryRegistration(lower: string): boolean {
  if (/\bentrega\b/.test(lower)) return true;
  if (/\b(ifood|99food|rappi|particular)\b/.test(lower)) return true;
  if (/\b(farmácia|farmacia|padaria|restaurante|loja|mercado)\b/.test(lower)) {
    return true;
  }
  return /\br\$\s*\d/.test(lower) && /\bentrega\b/.test(lower);
}

function parseMoneyAmount(lower: string): number | null {
  const brl = lower.match(/r\$\s*(\d{1,5}(?:[.,]\d{1,2})?)/);
  if (brl) return normalizeAmount(brl[1]);

  const reais = lower.match(
    /(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:reais|real|conto|pila)\b/,
  );
  if (reais) return normalizeAmount(reais[1]);

  const nearEntrega = lower.match(
    /entrega\s+(?:da\s+|de\s+|no\s+)?(\d{1,5}(?:[.,]\d{1,2})?)|(\d{1,5}(?:[.,]\d{1,2})?)\s+entrega\b/,
  );
  if (nearEntrega) return normalizeAmount(nearEntrega[1] ?? nearEntrega[2]);

  return null;
}

function normalizeAmount(raw: string): number | null {
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0 || n > 99_999) return null;
  return Number(n.toFixed(2));
}

function parseDeliverySource(lower: string): DeliverySource {
  if (/\bifood\b/.test(lower)) return "IFOOD";
  if (/\b(99\s*food|99food|noventa\s*e\s*nove)\b/.test(lower)) {
    return "NINETY_NINE";
  }
  if (/\b99\b/.test(lower) && /\bentrega\b/.test(lower)) return "NINETY_NINE";
  if (/\brappi\b/.test(lower)) return "RAPPI";
  if (/\bparticular\b/.test(lower)) return "PARTICULAR";
  return "PARTICULAR";
}
