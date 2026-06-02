import type { DeliverySource } from "@motoboy/types";

export type PlatformMatch = {
  source: DeliverySource;
  /** 1 = alias exato; menor distância Levenshtein = mais fraco */
  strength: number;
};

const PLATFORM_ALIASES: { source: DeliverySource; terms: string[] }[] = [
  {
    source: "IFOOD",
    terms: ["ifood", "i food", "i-food", "ifud", "ifod", "ifoo", "aifood"],
  },
  {
    source: "NINETY_NINE",
    terms: [
      "99food",
      "99 food",
      "99",
      "noventa e nove",
      "noventa nove",
      "ninetynine",
    ],
  },
  {
    source: "RAPPI",
    terms: ["rappi", "rapi", "rapp", "rapii"],
  },
  {
    source: "PARTICULAR",
    terms: ["particular", "part", "avulsa", "avulso", "direto"],
  },
];

const DELIVERY_INTENT_TERMS = [
  "entrega",
  "entreg",
  "entrg",
  "corrida",
  "fiz uma",
  "mais uma",
];

const PLACE_HINTS = [
  "farmacia",
  "farmácia",
  "padaria",
  "restaurante",
  "loja",
  "mercado",
];

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const up = dp[i - 1]![j]! + 1;
      const left = dp[i]![j - 1]! + 1;
      const diag =
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      dp[i]![j] = Math.min(up, left, diag);
    }
  }
  return dp[m]![n]!;
}

function tokenize(text: string): string[] {
  return text.split(/[^a-z0-9]+/).filter((t) => t.length > 0);
}

/** Palavra inteira ou token com até `maxDist` de edição. */
export function fuzzyContainsTerm(
  text: string,
  term: string,
  maxDist: number,
): boolean {
  const normalizedTerm = term.replace(/\s+/g, " ");
  if (text.includes(normalizedTerm)) return true;

  if (normalizedTerm.includes(" ")) {
    return text.includes(normalizedTerm);
  }

  for (const token of tokenize(text)) {
    if (levenshtein(token, normalizedTerm) <= maxDist) return true;
  }
  return false;
}

export function detectPlatform(text: string): PlatformMatch | null {
  let best: PlatformMatch | null = null;

  for (const { source, terms } of PLATFORM_ALIASES) {
    for (const term of terms) {
      if (text.includes(term)) {
        const strength = term.length >= 4 ? 1 : 0.85;
        if (!best || strength > best.strength) {
          best = { source, strength: 1 };
        }
        continue;
      }
      const maxDist = term.length <= 3 ? 0 : term.length <= 5 ? 1 : 2;
      if (maxDist > 0 && fuzzyContainsTerm(text, term, maxDist)) {
        if (!best || best.strength < 0.8) {
          best = { source, strength: 0.8 };
        }
      }
    }
  }

  if (/\b99\b/.test(text) && /\b(entrega|entreg|corrida)\b/.test(text)) {
    if (!best || best.strength < 0.85) {
      return { source: "NINETY_NINE", strength: 0.85 };
    }
  }

  return best;
}

export function hasDeliveryIntent(text: string): boolean {
  for (const term of DELIVERY_INTENT_TERMS) {
    if (text.includes(term)) return true;
    if (fuzzyContainsTerm(text, term, term.length <= 6 ? 2 : 1)) return true;
  }
  for (const hint of PLACE_HINTS) {
    if (text.includes(hint)) return true;
  }
  return false;
}

export function hasNonDeliveryIntent(text: string): boolean {
  return (
    /abastec|gasolina|posto|litro|litros|combustivel|combustível/.test(
      text,
    ) ||
    /painel|hodometro|hodômetro|km na moto|quilometr/.test(text) ||
    /quanto ganhei|resumo de hoje|meta de hoje/.test(text)
  );
}
