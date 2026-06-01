export type PeriodKind = "week" | "month";

function parseDateInput(value: string): { y: number; m: number; d: number } {
  const parts = value.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return { y, m, d };
}

function dateInputFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatShortDate(dateInput: string): string {
  const { m, d } = parseDateInput(dateInput);
  return `${d}/${String(m).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export type ResolvedPeriodRange = {
  period: PeriodKind;
  anchorDate: string;
  periodStart: string;
  periodEnd: string;
  rangeStart: Date;
  rangeEnd: Date;
  title: string;
  subtitle: string;
};

/** Semana = 7 dias terminando na data âncora. Mês = mês civil da âncora (até o dia âncora). */
export function resolvePeriodRange(
  period: PeriodKind,
  anchorDateInput: string,
): ResolvedPeriodRange {
  const { y, m, d } = parseDateInput(anchorDateInput);
  const anchorEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

  if (period === "week") {
    const rangeStart = new Date(y, m - 1, d, 0, 0, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - 6);
    const periodStart = dateInputFromParts(
      rangeStart.getFullYear(),
      rangeStart.getMonth() + 1,
      rangeStart.getDate(),
    );
    const periodEnd = anchorDateInput;
    return {
      period,
      anchorDate: anchorDateInput,
      periodStart,
      periodEnd,
      rangeStart,
      rangeEnd: anchorEnd,
      title: "Últimos 7 dias",
      subtitle: `${formatShortDate(periodStart)} – ${formatShortDate(periodEnd)}`,
    };
  }

  const rangeStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const periodStart = dateInputFromParts(y, m, 1);
  const periodEnd = anchorDateInput;
  const monthName = MONTH_NAMES[m - 1] ?? String(m);

  return {
    period,
    anchorDate: anchorDateInput,
    periodStart,
    periodEnd,
    rangeStart,
    rangeEnd: anchorEnd,
    title: `${monthName} ${y}`,
    subtitle: `${formatShortDate(periodStart)} – ${formatShortDate(periodEnd)}`,
  };
}

export function isIsoInPeriodRange(
  iso: string,
  range: Pick<ResolvedPeriodRange, "rangeStart" | "rangeEnd">,
): boolean {
  const at = new Date(iso);
  return at >= range.rangeStart && at <= range.rangeEnd;
}
