import {
  applyDailyCostExclusions,
  dailyCostExclusionId,
  isIsoInPeriodRange,
  resolvePeriodRange,
  type DailyCostExclusionItem,
  type DailyCostKey,
  type PeriodStats,
  type TodaySummary,
} from "@motoboy/types";

export type DailyCostExclusionTombstone = DailyCostExclusionItem & {
  /** Valor omitido no cliente até o servidor reconciliar. */
  amount?: number;
};

/** Exclusões de custos automáticos (Config) — espelha entregas apagadas. */
export function createExcludedDailyCostRegistry() {
  const entries = new Map<string, DailyCostExclusionTombstone>();

  function key(dateKey: string, costKey: DailyCostKey): string {
    return dailyCostExclusionId(dateKey, costKey);
  }

  return {
    mark(
      dateKey: string,
      costKey: DailyCostKey,
      amount?: number,
    ) {
      entries.set(key(dateKey, costKey), { dateKey, costKey, amount });
    },
    unmark(dateKey: string, costKey: DailyCostKey) {
      entries.delete(key(dateKey, costKey));
    },
    has(dateKey: string, costKey: DailyCostKey) {
      return entries.has(key(dateKey, costKey));
    },
    getExcludedForDate(dateKey: string): Set<DailyCostKey> {
      const set = new Set<DailyCostKey>();
      for (const e of entries.values()) {
        if (e.dateKey === dateKey) set.add(e.costKey);
      }
      return set;
    },
    clear() {
      entries.clear();
    },
    toArray(): DailyCostExclusionTombstone[] {
      return [...entries.values()];
    },
    hydrate(remote: DailyCostExclusionItem[]) {
      for (const item of remote) {
        const k = key(item.dateKey, item.costKey);
        const existing = entries.get(k);
        entries.set(k, { ...item, amount: existing?.amount });
      }
    },
    applyToTodaySummary(
      server: TodaySummary,
      dateKey: string,
    ): TodaySummary {
      const excluded = this.getExcludedForDate(dateKey);
      return applyDailyCostExclusions(server, excluded);
    },
    adjustPeriodStats(
      api: PeriodStats,
      period: "week" | "month",
      anchorDate: string,
    ): PeriodStats {
      if (entries.size === 0) return api;
      const range = resolvePeriodRange(period, anchorDate);
      let deltaExpenses = 0;
      const expenseRows = [...(api.expenses ?? [])];
      const rowByKey = new Map(expenseRows.map((r) => [r.key, r]));

      for (const tomb of entries.values()) {
        if (!isIsoInPeriodRange(`${tomb.dateKey}T12:00:00.000Z`, range)) {
          continue;
        }
        const amount = tomb.amount ?? 0;
        if (amount <= 0) continue;
        deltaExpenses += amount;
        const row = rowByKey.get(tomb.costKey);
        if (row && row.amount > 0) {
          row.amount = Math.max(0, row.amount - amount);
        }
      }

      if (deltaExpenses <= 0) return api;

      const expenses = expenseRows
        .filter((e) => e.amount > 0.005)
        .sort((a, b) => b.amount - a.amount);
      const totalExpenses = Math.max(0, api.totalExpenses - deltaExpenses);
      const totalNet = api.totalGross - totalExpenses;

      return {
        ...api,
        expenses,
        totalExpenses,
        totalNet,
        netPerHour:
          api.hoursWorked > 0 ? totalNet / api.hoursWorked : api.netPerHour,
      };
    },
  };
}

export type ExcludedDailyCostRegistry = ReturnType<
  typeof createExcludedDailyCostRegistry
>;
