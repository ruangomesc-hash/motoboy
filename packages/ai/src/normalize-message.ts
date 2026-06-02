/** Limpa mensagem informal do Zap antes de regras / IA. */
export function normalizeMotoboyMessage(text: string): string {
  let s = text.trim().toLowerCase();
  if (!s) return s;

  s = s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'");

  /** "4o ifood" → "40 ifood" (o/O no lugar do zero). */
  s = s.replace(/(\d)[oO](?=$|\s|[^0-9.,])/g, "$10");

  s = s
    .replace(/\brs\s+(?=\d)/g, "r$ ")
    .replace(/\br\$\s*(?=\d)/g, "r$ ")
    .replace(/(\d),(\d{2})\b/g, "$1.$2")
    .replace(/\s+/g, " ")
    .trim();

  return s;
}
