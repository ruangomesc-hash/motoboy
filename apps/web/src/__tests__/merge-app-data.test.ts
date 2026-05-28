import { describe, expect, it } from "vitest";
import type { TodaySummary } from "@motoboy/types";
import {
  dedupeRecentDeliveries,
  mergeDeliveryLists,
  mergeTodaySummary,
} from "@/lib/merge-app-data";
import type { DeliveryListItem } from "@/lib/app-persist-cache";

const todayKey = "2026-05-28";

describe("mergeDeliveryLists", () => {
  it("keeps pending local-* deliveries not yet on server", () => {
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

  it("does not re-add real ids that server already returned", () => {
    const row: DeliveryListItem = {
      id: "abc",
      grossValue: 30,
      source: "PARTICULAR",
      originName: "farmacia",
      occurredAt: `${todayKey}T16:55:00.000Z`,
      distanceKm: null,
    };
    const staleLocal: DeliveryListItem[] = [
      row,
      {
        id: "local-old",
        grossValue: 25,
        source: "PARTICULAR",
        originName: "mercado",
        occurredAt: `${todayKey}T14:05:00.000Z`,
        distanceKm: null,
      },
    ];
    const merged = mergeDeliveryLists([row], staleLocal, todayKey);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("abc");
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

  it("adds only pending local-* to server summary", () => {
    const local: TodaySummary = {
      ...emptyToday,
      grossTotal: 30,
      deliveryCount: 1,
      recentDeliveries: [
        {
          id: "local-1",
          grossValue: 30,
          source: "PARTICULAR",
          originName: "farmacia",
          occurredAt: `${todayKey}T16:55:00.000Z`,
        },
      ],
    };
    const merged = mergeTodaySummary(emptyToday, local, todayKey);
    expect(merged.recentDeliveries.some((r) => r.id === "local-1")).toBe(true);
    expect(merged.deliveryCount).toBe(1);
    expect(merged.grossTotal).toBe(30);
  });

  it("does not duplicate real ids already on server", () => {
    const server: TodaySummary = {
      ...emptyToday,
      grossTotal: 55,
      deliveryCount: 2,
      recentDeliveries: [
        {
          id: "real-1",
          grossValue: 30,
          source: "PARTICULAR",
          originName: "farm",
          occurredAt: `${todayKey}T14:05:00.000Z`,
        },
        {
          id: "real-2",
          grossValue: 25,
          source: "PARTICULAR",
          originName: "mercado",
          occurredAt: `${todayKey}T14:05:00.000Z`,
        },
      ],
    };
    const local: TodaySummary = {
      ...server,
      recentDeliveries: [
        ...server.recentDeliveries,
        {
          id: "real-1",
          grossValue: 30,
          source: "PARTICULAR",
          originName: "farm",
          occurredAt: `${todayKey}T14:05:00.000Z`,
        },
      ],
    };
    const merged = mergeTodaySummary(server, local, todayKey);
    expect(merged.grossTotal).toBe(55);
    expect(merged.recentDeliveries).toHaveLength(2);
  });
});

describe("dedupeRecentDeliveries", () => {
  it("removes duplicate ids", () => {
    const rows = [
      { id: "a", grossValue: 25 },
      { id: "b", grossValue: 30 },
      { id: "a", grossValue: 25 },
    ];
    expect(dedupeRecentDeliveries(rows)).toHaveLength(2);
  });
});
