import type { ExtractionResult } from "@motoboy/types";
import {
  detectExpenseLabel,
  hasExpenseIntent,
  hasFuelRefuelIntent,
} from "./expense-lexicon.js";
import { parseMoneyAmount } from "./message-money.js";
import { normalizeMotoboyMessage } from "./normalize-message.js";

/** Despesa manual (valor negativo no banco) — parser rápido antes da IA. */
export function tryParseExpenseFromText(
  text: string,
): Extract<ExtractionResult, { type: "expense" }> | null {
  const normalized = normalizeMotoboyMessage(text);
  if (!normalized) return null;

  if (hasFuelRefuelIntent(normalized)) return null;
  if (!hasExpenseIntent(normalized)) return null;

  const grossValue = parseMoneyAmount(normalized, {
    nearWordPattern:
      /despes[a-z]{0,3}\s+(?:de\s+|da\s+|no\s+|na\s+)?(\d{1,5}(?:\.\d{1,2})?)|(\d{1,5}(?:\.\d{1,2})?)\s+despes[a-z]{0,3}(?:\s|$)/,
    looseIf: hasExpenseIntent,
  });

  if (grossValue == null) return null;

  const originName = detectExpenseLabel(normalized);
  let confidence = 0.9;
  if (!originName) confidence -= 0.06;
  if (!/\bdespesa/.test(normalized)) confidence -= 0.05;

  return {
    type: "expense",
    grossValue,
    originName,
    confidence: Number(Math.max(0.65, Math.min(0.95, confidence)).toFixed(2)),
  };
}
