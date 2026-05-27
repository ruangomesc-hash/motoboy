/** Permite apenas dígitos e um separador decimal (, ou .). */
export function sanitizeDecimalInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  let separatorUsed = false;
  let result = "";
  for (const ch of cleaned) {
    if (ch === "." || ch === ",") {
      if (separatorUsed) continue;
      separatorUsed = true;
      result += ch;
      continue;
    }
    result += ch;
  }
  return result;
}

export function parseDecimalInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
