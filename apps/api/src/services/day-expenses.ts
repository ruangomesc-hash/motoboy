import type { FuelDayStats } from "@motoboy/types";

export type DayExpenseBreakdown = {
  fuelCost: number;
  maintenanceCost: number;
  otherCost: number;
  totalExpenses: number;
  costsConfigured: boolean;
};

/** Só aplica custos estimados/diários após o motoboy salvar em Configurações. */
export function computeDayExpenses(input: {
  costsConfigured: boolean;
  fuel: FuelDayStats;
  totalKm: number;
  hasActivity: boolean;
  dailyOther: number;
  maintenancePerKm: number;
}): DayExpenseBreakdown {
  if (!input.costsConfigured) {
    const fuelCost = input.fuel.isActual ? input.fuel.cost : 0;
    return {
      fuelCost,
      maintenanceCost: 0,
      otherCost: 0,
      totalExpenses: fuelCost,
      costsConfigured: false,
    };
  }

  const fuelCost = input.fuel.cost;
  const maintenanceCost =
    input.hasActivity && input.totalKm > 0
      ? input.totalKm * input.maintenancePerKm
      : 0;
  const otherCost = input.hasActivity ? input.dailyOther : 0;

  return {
    fuelCost,
    maintenanceCost,
    otherCost,
    totalExpenses: fuelCost + maintenanceCost + otherCost,
    costsConfigured: true,
  };
}
