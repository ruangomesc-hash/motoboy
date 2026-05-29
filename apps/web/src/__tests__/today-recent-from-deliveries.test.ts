import { describe, expect, it } from "vitest";
import type { TodaySummary } from "@motoboy/types";
import { recomputeTodayFromDeliveries } from "@/lib/today-recent-from-deliveries";
import type { DeliveryListItem } from "@/lib/app-persist-cache";

const todayKey = "2026-05-28";

const baseToday: TodaySummary = {
  grossTotal: 125,
  fuelCost: 0,
  maintenanceCost: 0,
  otherCost: 0,
  totalExpenses: 0,
  netProfit: 125,
  totalKm: 0,
  profitPerKm: 0,
  deliveryCount: 2,
  goalTarget: null,
  goalProgress: null,
  goalRemaining: null,
  goalsPlan: null,
  weeklyGoal: null,
  recentDeliveries: [],
  costsConfigured: false,
  fuel: {
    cost: 0,
    litersToday: 0,
    isActual: false,
    lastPricePerLiter: null,
    avgPricePerLiter: null,
    refuelCountToday: 0,
  },
  odometer: { currentKm: null, kmToday: 0, kmSource: "estimate" },
};

describe("recomputeTodayFromDeliveries", () => {
  it("totals match sum of deliveries after delete", () => {
    const deliveries: DeliveryListItem[] = [
      {
        id: "b",
        grossValue: 50,
        source: "PARTICULAR",
        originName: "lanchonete",
        occurredAt: `${todayKey}T14:23:00.000Z`,
        distanceKm: null,
      },
    ];
    const next = recomputeTodayFromDeliveries(deliveries, baseToday, todayKey);
    expect(next.grossTotal).toBe(50);
    expect(next.deliveryCount).toBe(1);
    expect(next.netProfit).toBe(50);
  });

  it("manual expense increases totalExpenses and lowers net", () => {
    const deliveries: DeliveryListItem[] = [
      {
        id: "a",
        grossValue: 100,
        source: "PARTICULAR",
        originName: "loja",
        occurredAt: `${todayKey}T10:00:00.000Z`,
        distanceKm: null,
      },
      {
        id: "b",
        grossValue: -20,
        source: "OTHER",
        originName: "Almoço",
        occurredAt: `${todayKey}T12:00:00.000Z`,
        distanceKm: null,
      },
    ];
    const next = recomputeTodayFromDeliveries(deliveries, baseToday, todayKey);
    expect(next.grossTotal).toBe(100);
    expect(next.deliveryCount).toBe(1);
    expect(next.totalExpenses).toBe(20);
    expect(next.netProfit).toBe(80);
    expect(next.manualExpensesTotal).toBe(20);
    expect(next.manualExpenseItems).toEqual([
      { id: "b", label: "Almoço", amount: 20 },
    ]);
  });
});
