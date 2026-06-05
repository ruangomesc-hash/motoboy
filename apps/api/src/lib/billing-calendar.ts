/** Datas de vencimento no formato Asaas (YYYY-MM-DD, calendário local). */

export function formatAsaasDueDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dueDateToday(): string {
  return formatAsaasDueDate(new Date());
}

export function dueDatePlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatAsaasDueDate(d);
}

/** Soma meses mantendo o dia do mês (ex.: 31/01 → 28/02). */
export function addMonthsPreserveDay(date: Date, months: number): Date {
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1, 12, 0, 0, 0);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

/**
 * Próxima cobrança: 1 mês após a data de pagamento (mesmo dia do mês).
 * Usado após o 1º pagamento e quando regulariza atraso.
 */
export function nextDueDateAfterPayment(paymentDate: Date): string {
  return formatAsaasDueDate(addMonthsPreserveDay(paymentDate, 1));
}

/**
 * Próximo vencimento no dia de cobrança do anchor (dia do 1º pagamento),
 * estritamente após `after` (para criar assinatura retroativa).
 */
export function nextDueDateOnBillingDay(
  billingAnchor: Date,
  after: Date = new Date(),
): string {
  const anchorDay = billingAnchor.getDate();
  const afterNoon = new Date(after);
  afterNoon.setHours(23, 59, 59, 999);

  let year = after.getFullYear();
  let month = after.getMonth();

  for (let i = 0; i < 36; i++) {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const candidate = new Date(year, month, Math.min(anchorDay, lastDay), 12, 0, 0, 0);
    const minNext = addMonthsPreserveDay(billingAnchor, 1);
    if (candidate > afterNoon && candidate >= minNext) {
      return formatAsaasDueDate(candidate);
    }
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return nextDueDateAfterPayment(after);
}

export function parseAsaasDueDate(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;
  const parts = value.trim().slice(0, 10).split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;
  const parsed = new Date(y, m - 1, d, 23, 59, 59, 999);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Pagamento feito após o vencimento original da cobrança (dia civil). */
export function isPaymentSettledAfterDueDate(
  paidAt: Date,
  dueDateRaw: string | undefined | null,
): boolean {
  if (!dueDateRaw?.trim()) return false;
  const dueDay = dueDateRaw.trim().slice(0, 10);
  const paidDay = formatAsaasDueDate(paidAt);
  return paidDay > dueDay;
}
