/** Quantidade de dígitos do WhatsApp brasileiro (DDD + número, sem +55). */
export const WHATSAPP_LOCAL_DIGITS = 11;

export const WHATSAPP_VALIDATION_MESSAGE =
  "Informe o WhatsApp com DDD: exatamente 11 números (ex.: 61999999999).";

/** Remove tudo que não for dígito. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Extrai os 11 dígitos locais (DDD + celular). Aceita entrada com ou sem 55.
 * @throws Error com mensagem amigável se inválido
 */
export function parseBrazilWhatsAppDigits(input: string): string {
  let digits = digitsOnly(input);
  if (digits.startsWith("55") && digits.length > WHATSAPP_LOCAL_DIGITS) {
    digits = digits.slice(2);
  }
  if (digits.length !== WHATSAPP_LOCAL_DIGITS) {
    throw new Error(WHATSAPP_VALIDATION_MESSAGE);
  }
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    throw new Error("DDD inválido. Use 2 dígitos de área válidos.");
  }
  if (digits[2] !== "9") {
    throw new Error("Use celular com 9 após o DDD (ex.: 61999999999).");
  }
  return digits;
}

/** Formato persistido na API/banco: 55 + 11 dígitos locais. */
export function toStoredWhatsApp(localDigits: string): string {
  const local = parseBrazilWhatsAppDigits(localDigits);
  return `55${local}`;
}

/** Máscara de digitação: (DD) 99999-9999 — no máximo 11 dígitos. */
export function maskBrazilWhatsAppInput(value: string): string {
  const d = digitsOnly(value).slice(0, WHATSAPP_LOCAL_DIGITS);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Exibe número armazenado (com ou sem 55) para o usuário. */
export function formatBrazilWhatsAppDisplay(stored: string): string {
  const local = stored.startsWith("55")
    ? stored.slice(2)
    : digitsOnly(stored);
  if (local.length !== WHATSAPP_LOCAL_DIGITS) return stored;
  return maskBrazilWhatsAppInput(local);
}
