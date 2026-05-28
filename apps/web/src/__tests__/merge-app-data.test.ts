import { describe, expect, it } from "vitest";
import type { TodaySummary } from "@motoboy/types";
import { mergeDeliveryLists, mergeTodaySummary } from "@/lib/merge-app-data";
import type { DeliveryListItem } from "@/lib/app-persist-cache";

const todayKey = "2026-05-28";

describe("mergeDeliveryLists", () => {
  it("keeps local deliveries missing from server for the filtered date", () => {
    const server: DeliveryListItem[] = [];
    const local: DeliveryListItem[] = [
      {
        id: "local-1",
        grossValue: 30,
        source: "PARTICULAR",
        originName: "farmacia",
        occurredAt: `${todayKey}T16:55:00.000Z`,
        distanceKm: null,
      },
    ];
    const merged = mergeDeliveryLists(server, local, todayKey);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("local-1");
  });

  it("does not duplicate when server already has the delivery", () => {
    const row: DeliveryListItem = {
      id: "abc",
      grossValue: 30,
      source: "PARTICULAR",
      originName: "farmacia",
      occurredAt: `${todayKey}T16:55:00.000Z`,
      distanceKm: null,
    };
    const merged = mergeDeliveryLists([row], [row], todayKey);
    expect(merged).toHaveLength(1);
  });
});

describe("mergeTodaySummary", () => {
  const emptyToday: TodaySummary = {
    grossTotal: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    otherCost: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalKm: 0,
    profitPerKm: 0,
    deliveryCount: 0,
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

  it("adds missing recent delivery from local state", () => {
    const local: TodaySummary = {
      ...emptyToday,
      grossTotal: 30,
      deliveryCount: 1,
      recentDeliveries: [
        {
          id: "real-1",
          grossValue: 30,
          source: "PARTICULAR",
          originName: "farmacia",
          occurredAt: `${todayKey}T16:55:00.000Z`,
        },
      ],
    };
    const merged = mergeTodaySummary(emptyToday, local, todayKey);
    expect(merged.recentDeliveries.some((r) => r.id === "real-1")).toBe(true);
    expect(merged.deliveryCount).toBe(1);
  });
});
