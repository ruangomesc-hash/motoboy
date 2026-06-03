export function isAsaasHostedInvoiceUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim().toLowerCase();
  return (
    (u.includes("asaas.com") || u.includes("asaas.com.br")) &&
    !u.includes("/assinar")
  );
}

export function isValidCpfDigits(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let mod = (sum * 10) % 11;
  const d1 = mod === 10 ? 0 : mod;
  if (d1 !== Number(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  mod = (sum * 10) % 11;
  const d2 = mod === 10 ? 0 : mod;
  return d2 === Number(digits[10]);
}
