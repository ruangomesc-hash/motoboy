export const EXPENSE_TAGS = [
  { id: "gasolina", label: "Gasolina" },
  { id: "almoco", label: "Almoço" },
  { id: "janta", label: "Janta" },
  { id: "lanche", label: "Lanche" },
  { id: "agua", label: "Água" },
  { id: "outro", label: "Outro" },
] as const;

export type ExpenseTagId = (typeof EXPENSE_TAGS)[number]["id"];

export function expenseLabelFromTag(
  tagId: ExpenseTagId,
  custom?: string | null,
): string {
  if (tagId === "outro") {
    const t = custom?.trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Outro";
  }
  return EXPENSE_TAGS.find((t) => t.id === tagId)?.label ?? "Despesa";
}

/** Exibe na Home o texto salvo (tag ou descrição livre). */
export function formatExpenseDisplayLabel(originName: string | null | undefined): string {
  const raw = originName?.trim();
  if (!raw) return "Despesa";
  const lower = raw.toLowerCase();
  for (const tag of EXPENSE_TAGS) {
    if (tag.id === "outro") continue;
    if (lower === tag.label.toLowerCase() || lower === tag.id) {
      return tag.label;
    }
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function guessExpenseTagId(
  originName: string | null | undefined,
): ExpenseTagId {
  const raw = originName?.trim();
  if (!raw) return "outro";
  const lower = raw.toLowerCase();
  for (const tag of EXPENSE_TAGS) {
    if (tag.id === "outro") continue;
    if (lower === tag.label.toLowerCase() || lower === tag.id) {
      return tag.id;
    }
  }
  return "outro";
}
