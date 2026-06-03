export function maskCepInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function cepDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function maskCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function cardNumberDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19);
}

export function maskCardExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

export function parseCardExpiry(value: string): {
  month: string;
  year: string;
} | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return null;
  const month = digits.slice(0, 2);
  const yearPart = digits.slice(2, 6);
  const year =
    yearPart.length === 4
      ? yearPart
      : yearPart.length === 2
        ? `20${yearPart}`
        : null;
  if (!year || Number(month) < 1 || Number(month) > 12) return null;
  return { month, year };
}

export function maskPhoneBillingInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function phoneBillingDigits(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) return d;
  if (d.length === 11) return `55${d}`;
  if (d.length === 10) return `55${d}`;
  return d;
}
