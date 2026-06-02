import type { DailyCostKey } from "./daily-cost.js";
import type { TodaySummary } from "./index.js";

/** Zera custos automáticos excluídos e recalcula totais do dia. */
export function applyDailyCostExclusions(
  today: TodaySummary,
  excluded: ReadonlySet<DailyCostKey>,
): TodaySummary {
  if (!excluded.size) return today;

  const fuelCost = excluded.has("fuel") ? 0 : today.fuelCost;
  const maintenanceCost = excluded.has("maintenance") ? 0 : today.maintenanceCost;
  const otherCost = excluded.has("other") ? 0 : today.otherCost;
  const manual = today.manualExpensesTotal ?? 0;
  const totalExpenses = fuelCost + maintenanceCost + otherCost + manual;
  const netProfit = today.grossTotal - totalExpenses;
  const profitPerKm =
    today.totalKm > 0 ? netProfit / today.totalKm : today.profitPerKm;

  return {
    ...today,
    fuelCost,
    maintenanceCost,
    otherCost,
    totalExpenses,
    netProfit,
    profitPerKm,
  };
}
