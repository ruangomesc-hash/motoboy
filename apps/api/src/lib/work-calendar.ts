/** 0 = domingo … 6 = sábado (igual Date.getDay()). */
export const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5, 6] as const;

export function parseWorkDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [...DEFAULT_WORK_DAYS];
  const days = value
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  return days.length > 0 ? [...new Set(days)].sort((a, b) => a - b) : [...DEFAULT_WORK_DAYS];
}

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Semana calendário: segunda 00:00 até domingo 23:59 (fim exclusivo = próxima segunda). */
export function startOfCalendarWeek(date = new Date()): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function endOfCalendarWeek(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return end;
}

export function startOfCalendarMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfCalendarMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function countWorkDaysInRange(
  rangeStart: Date,
  rangeEnd: Date,
  workDays: number[],
): number {
  const set = new Set(workDays);
  let count = 0;
  const cursor = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);
  while (cursor < end) {
    if (set.has(cursor.getDay())) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}
