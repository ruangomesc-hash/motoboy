import {
  formatBrazilWhatsAppDisplay,
  parseBrazilWhatsAppDigits,
  toStoredWhatsApp,
} from "@motoboy/types";

export {
  WHATSAPP_LOCAL_DIGITS,
  WHATSAPP_VALIDATION_MESSAGE,
  digitsOnly,
  parseBrazilWhatsAppDigits,
  maskBrazilWhatsAppInput,
  formatBrazilWhatsAppDisplay,
} from "@motoboy/types";

/** Normaliza para armazenamento: 55 + 11 dígitos locais. */
export function normalizePhone(phone: string): string {
  return toStoredWhatsApp(phone);
}

export function formatPhoneDisplay(phone: string): string {
  return formatBrazilWhatsAppDisplay(phone);
}

/** Valida e retorna 11 dígitos locais (sem 55). */
export function parseLocalPhone(phone: string): string {
  return parseBrazilWhatsAppDigits(phone);
}
