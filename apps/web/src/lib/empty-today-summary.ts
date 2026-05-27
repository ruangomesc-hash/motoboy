import type { TodaySummary } from "@motoboy/types";

export function emptyTodaySummary(): TodaySummary {
  return {
    grossTotal: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    otherCost: 0,
    totalExpenses: 0,
    netProfit: 0,
    costsConfigured: false,
    totalKm: 0,
    profitPerKm: 0,
    deliveryCount: 0,
    goalTarget: null,
    goalProgress: null,
    goalRemaining: null,
    goalsPlan: null,
    weeklyGoal: null,
    recentDeliveries: [],
    fuel: {
      cost: 0,
      litersToday: 0,
      isActual: false,
      lastPricePerLiter: null,
      avgPricePerLiter: null,
      refuelCountToday: 0,
    },
    odometer: {
      currentKm: null,
      kmToday: 0,
      kmSource: "estimate",
    },
  };
}
