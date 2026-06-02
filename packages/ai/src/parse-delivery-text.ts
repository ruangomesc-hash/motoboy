import type { DeliverySource, ExtractionResult } from "@motoboy/types";
import {
  APP_AMOUNT_PLATFORM_PATTERN,
  detectAppPlatform,
  hasDeliveryIntent,
  hasNonDeliveryIntent,
  resolveDeliverySource,
} from "./delivery-lexicon.js";
import { normalizeMotoboyMessage } from "./normalize-message.js";

/** Extrai entrega de texto informal antes da IA (evita R$ 25 / PARTICULAR fixos). */
export function tryParseDeliveryFromText(
  text: string,
): Extract<ExtractionResult, { type: "delivery" }> | null {
  const normalized = normalizeMotoboyMessage(text);
  if (!normalized) return null;

  if (hasNonDeliveryIntent(normalized)) return null;

  const grossValue = parseMoneyAmount(normalized);
  if (grossValue == null) return null;

  const intent = classifyDeliveryIntent(normalized);
  if (!intent.isDelivery) return null;

  const platform = detectAppPlatform(normalized);
  const source = resolveDeliverySource(normalized);

  let confidence = 0.92;
  if (intent.fuzzyIntent) confidence -= 0.08;
  if (!platform && source === "PARTICULAR") confidence -= 0.04;
  else if (platform && platform.strength < 1) confidence -= 0.1;
  if (intent.amountPattern === "loose") confidence -= 0.06;
  confidence = Math.max(0.65, Math.min(0.95, confidence));

  return {
    type: "delivery",
    source,
    grossValue,
    originName: null,
    destinationAddr: null,
    distanceKm: null,
    confidence: Number(confidence.toFixed(2)),
  };
}

function classifyDeliveryIntent(normalized: string): {
  isDelivery: boolean;
  fuzzyIntent: boolean;
  amountPattern: "strict" | "loose";
} {
  const platform = detectAppPlatform(normalized);
  const explicitIntent = hasDeliveryIntent(normalized);

  if (explicitIntent) {
    return {
      isDelivery: true,
      fuzzyIntent: !/\bentrega\b/.test(normalized),
      amountPattern: "strict",
    };
  }

  if (platform) {
    return {
      isDelivery: true,
      fuzzyIntent: false,
      amountPattern: "loose",
    };
  }

  if (/\br\$\s*\d/.test(normalized) && /entreg[a-z]{0,4}/.test(normalized)) {
    return { isDelivery: true, fuzzyIntent: true, amountPattern: "strict" };
  }

  return { isDelivery: false, fuzzyIntent: false, amountPattern: "strict" };
}

function amountFromMatch(...groups: (string | undefined)[]): number | null {
  for (const g of groups) {
    if (g) {
      const n = normalizeAmount(g);
      if (n != null) return n;
    }
  }
  return null;
}

function parseMoneyAmount(normalized: string): number | null {
  const brl = normalized.match(/r\$\s*(\d{1,5}(?:\.\d{1,2})?)/);
  const fromBrl = amountFromMatch(brl?.[1]);
  if (fromBrl != null) return fromBrl;

  const reais = normalized.match(
    /(\d{1,5}(?:\.\d{1,2})?)\s*(?:reais|real|conto|pila)\b/,
  );
  const fromReais = amountFromMatch(reais?.[1]);
  if (fromReais != null) return fromReais;

  const nearEntrega = normalized.match(
    /entreg[a-z]{0,4}\s+(?:da\s+|de\s+|no\s+)?(\d{1,5}(?:\.\d{1,2})?)|(\d{1,5}(?:\.\d{1,2})?)\s+entreg[a-z]{0,4}(?:\s|$)/,
  );
  const fromEntrega = amountFromMatch(nearEntrega?.[1], nearEntrega?.[2]);
  if (fromEntrega != null) return fromEntrega;

  const platform = detectAppPlatform(normalized);
  if (platform) {
    const paired = normalized.match(
      new RegExp(
        `(\\d{1,5}(?:\\.\\d{1,2})?)\\s+(?:${APP_AMOUNT_PLATFORM_PATTERN})\\b|(?:${APP_AMOUNT_PLATFORM_PATTERN})\\s+(\\d{1,5}(?:\\.\\d{1,2})?)`,
      ),
    );
    const fromPair = amountFromMatch(paired?.[1], paired?.[2]);
    if (fromPair != null) return fromPair;
  }

  if (hasDeliveryIntent(normalized) || platform) {
    return parseLooseAmount(normalized, platform?.source ?? null);
  }

  return null;
}

/** Ex.: "30 entrg 99" — valor antes da plataforma. */
function parseLooseAmount(
  normalized: string,
  platform: DeliverySource | null,
): number | null {
  const nums: number[] = [];
  for (const m of normalized.matchAll(/\b(\d{1,5}(?:\.\d{1,2})?)\b/g)) {
    const n = normalizeAmount(m[1] ?? "");
    if (n != null) nums.push(n);
  }
  if (!nums.length) return null;
  if (nums.length === 1) return nums[0] ?? null;

  if (platform === "NINETY_NINE") {
    const without99 = nums.filter((n) => n !== 99);
    if (without99.length) return without99[0] ?? null;
  }

  return nums[0] ?? null;
}

function normalizeAmount(raw: string): number | null {
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0 || n > 99_999) return null;
  return Number(n.toFixed(2));
}
