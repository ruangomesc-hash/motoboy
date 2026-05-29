/** Data local no formato do input type="date" (YYYY-MM-DD). */
export function todayDateInputValue(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function yesterdayDateInputValue(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return todayDateInputValue(d);
}

/**
 * Mantém o filtro de Entregas no dia atual do celular (fuso local do sistema —
 * o mesmo que o calendário do aparelho / Google Calendar usa para "hoje").
 * Se o cache ficou em "ontem" (app aberto após meia-noite), avança para hoje.
 * Datas mais antigas são preservadas (consulta de dias anteriores).
 */
export function resolveDeliveriesFilterDate(
  cached: string | undefined,
  now = new Date(),
): string {
  const today = todayDateInputValue(now);
  if (!cached?.trim()) return today;
  if (cached === today) return today;
  if (cached === yesterdayDateInputValue(now)) return today;
  return cached;
}

/** ISO a partir do valor de input datetime-local (YYYY-MM-DDTHH:mm). */
export function isoFromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

/** Valor para input datetime-local a partir de ISO. */
export function datetimeLocalFromIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function isIsoOnDateInput(iso: string, dateInput: string): boolean {
  if (!dateInput) return true;
  return todayDateInputValue(new Date(iso)) === dateInput;
}

export function formatDateTimeLabel(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
