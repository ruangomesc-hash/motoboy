import type { ExtractionResult } from "@motoboy/types";
import {
  APP_AMOUNT_PLATFORM_PATTERN,
  detectAppPlatform,
  hasDeliveryIntent,
  hasNonDeliveryIntent,
  resolveDeliverySource,
} from "./delivery-lexicon.js";
import { hasExpenseIntent } from "./expense-lexicon.js";
import { parseLooseAmount, parseMoneyAmount } from "./message-money.js";
import { normalizeMotoboyMessage } from "./normalize-message.js";

/** Extrai entrega de texto informal antes da IA (evita R$ 25 / PARTICULAR fixos). */
export function tryParseDeliveryFromText(
  text: string,
): Extract<ExtractionResult, { type: "delivery" }> | null {
  const normalized = normalizeMotoboyMessage(text);
  if (!normalized) return null;

  if (hasExpenseIntent(normalized)) return null;
  if (hasNonDeliveryIntent(normalized)) return null;

  const platform = detectAppPlatform(normalized);
  const intent = classifyDeliveryIntent(normalized);
  if (!intent.isDelivery) return null;

  const grossValue = parseMoneyAmount(normalized, {
    nearWordPattern:
      /entreg[a-z]{0,4}\s+(?:da\s+|de\s+|no\s+)?(\d{1,5}(?:\.\d{1,2})?)|(\d{1,5}(?:\.\d{1,2})?)\s+entreg[a-z]{0,4}(?:\s|$)/,
    pairedPlatformPattern: APP_AMOUNT_PLATFORM_PATTERN,
    looseIf: (t) => hasDeliveryIntent(t) || Boolean(detectAppPlatform(t)),
    loosePlatform: platform?.source ?? null,
  });

  if (grossValue == null) return null;

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
