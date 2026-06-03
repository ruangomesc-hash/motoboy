import type { DailyCostKey, FuelDayStats } from "@motoboy/types";

export type DayExpenseBreakdown = {
  fuelCost: number;
  maintenanceCost: number;
  otherCost: number;
  totalExpenses: number;
  costsConfigured: boolean;
};

/** Custos do dia: só abastecimento real (Zap/cupom). Sem estimativa por km ou fallback de Config. */
export function computeDayExpenses(input: {
  fuel: FuelDayStats;
  excludedKeys?: ReadonlySet<DailyCostKey>;
}): DayExpenseBreakdown {
  const excluded = input.excludedKeys ?? new Set<DailyCostKey>();
  const fuelCost =
    excluded.has("fuel") || !input.fuel.isActual ? 0 : input.fuel.cost;

  return {
    fuelCost,
    maintenanceCost: 0,
    otherCost: 0,
    totalExpenses: fuelCost,
    costsConfigured: false,
  };
}
