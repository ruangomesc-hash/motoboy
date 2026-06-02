import type { DeliverySource } from "@motoboy/types";
import { detectAppPlatform } from "./delivery-lexicon.js";

export function normalizeAmount(raw: string): number | null {
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0 || n > 99_999) return null;
  return Number(n.toFixed(2));
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

/** Valor em reais em mensagem normalizada (compartilhado entrega/despesa). */
export function parseMoneyAmount(
  normalized: string,
  options?: {
    nearWordPattern?: RegExp;
    looseIf?: (text: string) => boolean;
    loosePlatform?: DeliverySource | null;
    pairedPlatformPattern?: string;
  },
): number | null {
  const brl = normalized.match(/r\$\s*(\d{1,5}(?:\.\d{1,2})?)/);
  const fromBrl = amountFromMatch(brl?.[1]);
  if (fromBrl != null) return fromBrl;

  const reais = normalized.match(
    /(\d{1,5}(?:\.\d{1,2})?)\s*(?:reais|real|conto|pila)\b/,
  );
  const fromReais = amountFromMatch(reais?.[1]);
  if (fromReais != null) return fromReais;

  if (options?.nearWordPattern) {
    const near = normalized.match(options.nearWordPattern);
    const fromNear = amountFromMatch(near?.[1], near?.[2]);
    if (fromNear != null) return fromNear;
  }

  if (options?.pairedPlatformPattern) {
    const paired = normalized.match(
      new RegExp(
        `(\\d{1,5}(?:\\.\\d{1,2})?)\\s+(?:${options.pairedPlatformPattern})\\b|(?:${options.pairedPlatformPattern})\\s+(\\d{1,5}(?:\\.\\d{1,2})?)`,
      ),
    );
    const fromPair = amountFromMatch(paired?.[1], paired?.[2]);
    if (fromPair != null) return fromPair;
  }

  if (options?.looseIf?.(normalized)) {
    return parseLooseAmount(normalized, options.loosePlatform ?? null);
  }

  return null;
}

export function parseLooseAmount(
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
