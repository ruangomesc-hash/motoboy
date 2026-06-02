const DATE_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Brasil (sem horário de verão desde 2019): UTC−3 fixo. */
const BRT_UTC_OFFSET_HOURS = 3;

/**
 * Intervalo [início, fim) para um dia YYYY-MM-DD no calendário do Brasil.
 * O app envia a data no fuso do celular; o produto é BR → alinhamos a BRT.
 */
export function dayRangeFromDateInput(dateInput: string): {
  start: Date;
  end: Date;
} {
  const m = DATE_INPUT_RE.exec(dateInput.trim());
  if (!m) {
    throw new Error("Data inválida");
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) {
    throw new Error("Data inválida");
  }
  const start = new Date(
    Date.UTC(y, mo - 1, d, BRT_UTC_OFFSET_HOURS, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(y, mo - 1, d + 1, BRT_UTC_OFFSET_HOURS, 0, 0, 0),
  );
  return { start, end };
}

export function dayRangeFromDateInputInclusiveEnd(
  fromInput: string,
  toInput: string,
): { start: Date; end: Date } {
  const start = dayRangeFromDateInput(fromInput).start;
  const end = dayRangeFromDateInput(toInput).end;
  return { start, end };
}
