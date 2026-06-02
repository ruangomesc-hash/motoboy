import { z } from "zod";

export const dailyCostKeySchema = z.enum(["fuel", "maintenance", "other"]);

export type DailyCostKey = z.infer<typeof dailyCostKeySchema>;

export const DAILY_COST_KEYS: DailyCostKey[] = [
  "fuel",
  "maintenance",
  "other",
];

export function isDailyCostKey(value: string): value is DailyCostKey {
  return dailyCostKeySchema.safeParse(value).success;
}

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dailyCostExclusionBodySchema = z.object({
  dateKey: dateKeySchema,
  costKey: dailyCostKeySchema,
});

export type DailyCostExclusionBody = z.infer<typeof dailyCostExclusionBodySchema>;

export type DailyCostExclusionItem = DailyCostExclusionBody;

export function dailyCostExclusionId(
  dateKey: string,
  costKey: DailyCostKey,
): string {
  return `${dateKey}:${costKey}`;
}

/** Campos de custo do resumo do dia. */
export type TodayCostSummaryFields = {
  grossTotal: number;
  fuelCost: number;
  maintenanceCost: number;
  otherCost: number;
  manualExpensesTotal?: number;
  totalExpenses: number;
  netProfit: number;
  totalKm: number;
  profitPerKm: number;
};

/** Zera custos automáticos excluídos e recalcula totais do dia. */
export function applyDailyCostExclusions<T extends TodayCostSummaryFields>(
  today: T,
  excluded: ReadonlySet<DailyCostKey>,
): T {
  if (!excluded.size) return today;

  const fuelCost = excluded.has("fuel") ? 0 : today.fuelCost;
  const maintenanceCost = excluded.has("maintenance")
    ? 0
    : today.maintenanceCost;
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
