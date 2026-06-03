/** Apenas dígitos (11 = CPF, 14 = CNPJ). */
export function normalizeCpfCnpjDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function cpfChecksum(digits: string, factor: number): number {
  let sum = 0;
  for (let i = 0; i < factor - 1; i++) {
    sum += Number(digits[i]) * (factor - i);
  }
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
}

export function isValidCpf(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const d1 = cpfChecksum(digits, 10);
  const d2 = cpfChecksum(digits, 11);
  return d1 === Number(digits[9]) && d2 === Number(digits[10]);
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = normalizeCpfCnpjDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return true;
  return false;
}

export function formatCpfCnpjError(): string {
  return "Informe um CPF válido (11 dígitos).";
}
