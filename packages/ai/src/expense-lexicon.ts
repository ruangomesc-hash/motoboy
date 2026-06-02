import { expenseLabelFromTag, type ExpenseTagId } from "@motoboy/types";
import { fuzzyContainsTerm } from "./delivery-lexicon.js";

const EXPENSE_INTENT_TERMS = [
  "despesa",
  "despesas",
  "gastei",
  "paguei",
  "pagamento",
  "gasto",
  "gastos",
];

const EXPENSE_TAG_ALIASES: { id: ExpenseTagId; terms: string[] }[] = [
  { id: "gasolina", terms: ["gasolina", "combustivel", "combustível"] },
  { id: "almoco", terms: ["almoco", "almoço"] },
  { id: "janta", terms: ["janta", "jantar"] },
  { id: "lanche", terms: ["lanche", "lanches"] },
  { id: "agua", terms: ["agua", "água", "agua"] },
];

/** Abastecimento com litros/posto — não é despesa manual rápida. */
export function hasFuelRefuelIntent(text: string): boolean {
  if (/abastec|enchi|posto/.test(text)) return true;
  if (/gasolina|combustivel|combustível/.test(text) && /litro|litros|\d+\s*l\b/.test(text)) {
    return true;
  }
  return false;
}

export function hasExpenseIntent(text: string): boolean {
  if (hasFuelRefuelIntent(text)) return false;

  for (const term of EXPENSE_INTENT_TERMS) {
    if (text.includes(term)) return true;
    if (fuzzyContainsTerm(text, term, term.length <= 6 ? 2 : 1)) return true;
  }

  for (const { terms } of EXPENSE_TAG_ALIASES) {
    for (const term of terms) {
      if (text.includes(term)) return true;
    }
  }

  if (/entreg[a-z]{0,4}\s+(?:da|de|do|no|na)\s+/.test(text) && /despesa/.test(text)) {
    return true;
  }

  return false;
}

export function detectExpenseLabel(text: string): string | null {
  for (const { id, terms } of EXPENSE_TAG_ALIASES) {
    for (const term of terms) {
      if (text.includes(term)) {
        return expenseLabelFromTag(id);
      }
      if (fuzzyContainsTerm(text, term, 1)) {
        return expenseLabelFromTag(id);
      }
    }
  }

  const custom = text.match(
    /despesa\s+(?:de\s+|da\s+|no\s+|na\s+)?([a-z0-9\s]{2,40})/,
  );
  if (custom?.[1]) {
    const label = custom[1]
      .replace(/\b\d{1,5}(?:\.\d{1,2})?\b/g, "")
      .replace(/\b(reais|real|r\$|conto|pila)\b/g, "")
      .trim();
    if (label.length >= 2) {
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  }

  const paid = text.match(
    /(?:gastei|paguei)\s+(?:\d{1,5}(?:\.\d{1,2})?\s*)?(?:reais\s+)?(?:no\s+|na\s+)?([a-z0-9\s]{2,30})/,
  );
  if (paid?.[1]) {
    const label = paid[1].trim();
    if (label.length >= 2 && !/^\d/.test(label)) {
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
  }

  return null;
}
