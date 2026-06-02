/** Corrige transcrição de áudio (Whisper) para nomes de app. */
export function applyWhisperPlatformAliases(text: string): string {
  return text
    .replace(
      /noventa\s+e\s+nove|noventa\s+nove|nove\s+nove|noventa\s+e\s+9\b/g,
      " 99 ",
    )
    .replace(/\b(?:rapi|repi|rappy|hapi|wrapi|rafi)\b/g, " rappi ")
    .replace(/\bi\s*food\b/g, " ifood ")
    .replace(/\s+/g, " ")
    .trim();
}

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

  return applyWhisperPlatformAliases(s);
}
