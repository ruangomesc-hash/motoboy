import type { DeliverySource } from "@motoboy/types";

export type PlatformMatch = {
  source: DeliverySource;
  strength: number;
};

type AppSource = Exclude<DeliverySource, "PARTICULAR" | "OTHER">;

const APP_PLATFORM_ALIASES: { source: AppSource; terms: string[] }[] = [
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
      "nove nove",
      "noventa e 9",
      "ninetynine",
    ],
  },
  {
    source: "RAPPI",
    terms: [
      "rappi",
      "rapi",
      "repi",
      "rappy",
      "hapi",
      "wrapi",
      "rafi",
      "rapp",
      "rapii",
    ],
  },
];

const PARTICULAR_TERMS = ["particular", "part", "avulsa", "avulso", "direto"];

const DELIVERY_INTENT_TERMS = [
  "entrega",
  "entreg",
  "entrg",
  "corrida",
  "fiz uma",
  "mais uma",
];

/** Comércio local (não app) → source PARTICULAR. */
const COMMERCE_PLACE_HINTS = [
  "farmacia",
  "padaria",
  "restaurante",
  "loja",
  "mercado",
  "drogaria",
  "pizzaria",
  "lanchonete",
  "acougue",
  "petshop",
  "pet shop",
  "hortifruti",
  "mercearia",
  "sorveteria",
  "conveniencia",
  "escritorio",
  "atacadao",
  "supermercado",
  "shopping",
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

/** Só apps (iFood / 99 / Rappi) — inclui como o Whisper costuma transcrever. */
export function detectAppPlatform(text: string): PlatformMatch | null {
  let best: PlatformMatch | null = null;

  for (const { source, terms } of APP_PLATFORM_ALIASES) {
    for (const term of terms) {
      if (text.includes(term)) {
        if (!best || best.strength < 1) {
          best = { source, strength: 1 };
        }
        continue;
      }
      const maxDist = term.length <= 3 ? 0 : term.length <= 5 ? 1 : 2;
      if (maxDist > 0 && fuzzyContainsTerm(text, term, maxDist)) {
        if (!best || best.strength < 0.82) {
          best = { source, strength: 0.82 };
        }
      }
    }
  }

  if (
    /noventa\s+e\s+nove|noventa\s+nove|nove\s+nove|noventa\s+e\s+9\b/.test(
      text,
    )
  ) {
    return { source: "NINETY_NINE", strength: 0.95 };
  }

  if (/\b99\b/.test(text) && hasAnotherAmountBesides99(text)) {
    return { source: "NINETY_NINE", strength: 0.88 };
  }

  return best;
}

function hasAnotherAmountBesides99(text: string): boolean {
  const nums: number[] = [];
  for (const m of text.matchAll(/\b(\d{1,5}(?:\.\d{1,2})?)\b/g)) {
    const n = Number(m[1]?.replace(",", "."));
    if (Number.isFinite(n) && n > 0) nums.push(n);
  }
  return nums.some((n) => n !== 99);
}

/** @deprecated Use detectAppPlatform — mantido para diagnósticos. */
export function detectPlatform(text: string): PlatformMatch | null {
  return detectAppPlatform(text);
}

/** Nome de comércio / lugar sem app de delivery. */
export function hasCommercePlaceContext(text: string): boolean {
  if (detectAppPlatform(text)) return false;

  for (const hint of COMMERCE_PLACE_HINTS) {
    if (text.includes(hint)) return true;
  }
  if (/\bbar\b/.test(text)) return true;

  if (
    /entreg[a-z]{0,4}\s+(?:da|de|do|no|na)\s+[a-z0-9]{3,}/.test(text) ||
    /(?:da|de|do|no|na)\s+(?:farmacia|padaria|restaurante|loja|mercado|drogaria|pizzaria|lanchonete|acougue|petshop|hortifruti)/.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /\d{1,5}(?:\.\d{1,2})?\s+(?:farmacia|padaria|restaurante|loja|mercado|drogaria|pizzaria)\b/.test(
      text,
    )
  ) {
    return true;
  }

  return false;
}

export function resolveDeliverySource(text: string): DeliverySource {
  const app = detectAppPlatform(text);
  if (app) return app.source;

  for (const term of PARTICULAR_TERMS) {
    if (text.includes(term)) return "PARTICULAR";
  }

  if (hasCommercePlaceContext(text)) return "PARTICULAR";

  return "PARTICULAR";
}

export function hasDeliveryIntent(text: string): boolean {
  for (const term of DELIVERY_INTENT_TERMS) {
    if (text.includes(term)) return true;
    if (fuzzyContainsTerm(text, term, term.length <= 6 ? 2 : 1)) return true;
  }
  if (hasCommercePlaceContext(text)) return true;
  if (detectAppPlatform(text)) return true;
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

function stripAppPlatformTokens(text: string): string {
  let s = ` ${text} `;
  for (const { terms } of APP_PLATFORM_ALIASES) {
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      s = s.replace(new RegExp(`\\s${escaped}\\s`, "g"), " ");
    }
  }
  s = s
    .replace(/\snoventa\s+e\s+nove\s/g, " ")
    .replace(/\snoventa\s+nove\s/g, " ")
    .replace(/\s99\s/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

function isOnlyAppPlatformLabel(text: string): boolean {
  const stripped = stripAppPlatformTokens(text);
  const withoutNums = stripped.replace(/\d+(?:\.\d{1,2})?/g, "").trim();
  return withoutNums.length < 2;
}

function formatOriginNameLabel(text: string): string {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Nome do local (campo originName / "Nome / local") após "entrega …".
 * Origem (iFood/99/Particular) vem de resolveDeliverySource — não misturar.
 */
export function parseDeliveryOriginName(
  text: string,
  source: DeliverySource,
): string | null {
  let raw: string | null = null;

  const withPrep = text.match(
    /entreg[a-z]{0,4}\s+(?:da|de|do|no|na)\s+(.+)$/i,
  );
  if (withPrep?.[1]?.trim()) {
    raw = withPrep[1].trim();
  } else {
    const afterEntrega = text.match(/entreg[a-z]{0,4}\s+(.+)$/i);
    if (afterEntrega?.[1]?.trim()) {
      raw = afterEntrega[1].trim();
    }
  }

  if (!raw) {
    const loose = text.match(
      /\d{1,5}(?:\.\d{1,2})?\s+((?:farmacia|padaria|restaurante|loja|mercado|drogaria|pizzaria|lanchonete|acougue|petshop|hortifruti|mercearia|supermercado)(?:\s+[a-z0-9]+)*)/i,
    );
    if (loose?.[1]?.trim()) raw = loose[1].trim();
  }

  if (!raw) return null;

  raw = raw
    .replace(/^\d{1,5}(?:\.\d{1,2})?\s+/g, "")
    .replace(/\s+r\$\s*\d[\d.]*\s*$/gi, "")
    .replace(/\s+\d{1,5}(?:\.\d{1,2})?\s*$/g, "")
    .trim();

  if (raw.length < 2 || isOnlyAppPlatformLabel(raw)) return null;

  const app = detectAppPlatform(raw);
  if (
    app &&
    app.strength >= 0.88 &&
    source !== "PARTICULAR" &&
    isOnlyAppPlatformLabel(raw)
  ) {
    return null;
  }

  for (const term of PARTICULAR_TERMS) {
    if (raw === term) return null;
  }

  return formatOriginNameLabel(raw);
}

/** Padrão para parear valor + app na regex de dinheiro. */
export const APP_AMOUNT_PLATFORM_PATTERN =
  "ifood|ifud|ifod|i food|99food|99 food|99|noventa e nove|noventa nove|nove nove|rappi|rapi|repi|rappy|hapi|wrapi";
