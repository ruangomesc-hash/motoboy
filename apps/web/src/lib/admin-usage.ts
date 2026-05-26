/** Cálculo de tempo de uso (espelha a API). */
export function computeAppUsage(createdAt: Date): {
  usageDays: number;
  usageMonths: number;
  usageRemainderDays: number;
} {
  const now = new Date();
  const start = new Date(createdAt);
  const usageDays = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / 86400000),
  );
  let usageMonths =
    now.getFullYear() * 12 +
    now.getMonth() -
    (start.getFullYear() * 12 + start.getMonth());
  let usageRemainderDays = now.getDate() - start.getDate();
  if (usageRemainderDays < 0) {
    usageMonths--;
    usageRemainderDays += new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
  }
  return {
    usageDays,
    usageMonths: Math.max(0, usageMonths),
    usageRemainderDays: Math.max(0, usageRemainderDays),
  };
}

export function withUsage<T extends { createdAt: string }>(
  row: T,
): T & {
  usageDays: number;
  usageMonths: number;
  usageRemainderDays: number;
} {
  return { ...row, ...computeAppUsage(new Date(row.createdAt)) };
}
