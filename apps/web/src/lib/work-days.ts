/** 0 = domingo … 6 = sábado */
export const WEEKDAY_OPTIONS = [
  { id: 0, label: "Dom", short: "D" },
  { id: 1, label: "Seg", short: "S" },
  { id: 2, label: "Ter", short: "T" },
  { id: 3, label: "Qua", short: "Q" },
  { id: 4, label: "Qui", short: "Q" },
  { id: 5, label: "Sex", short: "S" },
  { id: 6, label: "Sáb", short: "S" },
] as const;

export const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5, 6];
