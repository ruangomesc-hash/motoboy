import { describe, expect, it } from "vitest";
import type { TodaySummary } from "@motoboy/types";
import {
  mergeDeliveryLists,
  mergeDeliveryListsFromServerPoll,
  mergeTodayFromServer,
  selectDeliveriesForDate,
} from "@/lib/merge-app-data";
import type { DeliveryListItem } from "@/lib/app-persist-cache";

const todayKey = "2026-05-28";

describe("mergeDeliveryLists", () => {
  it("keeps local delivery when server response is behind", () => {
    const server: DeliveryListItem[] = [
      {
        id: "a",
        grossValue: 25,
        source: "PARTICULAR",
        originName: "mercado",
        occurredAt: `${todayKey}T14:05:00.000Z`,
        distanceKm: null,
      },
    ];
    const local: DeliveryListItem[] = [
      ...server,
      {
        id: "b",
        grossValue: 30,
        source: "PARTICULAR",
        originName: "farm",
        occurredAt: `${todayKey}T14:10:00.000Z`,
        distanceKm: null,
      },
    ];
    const merged = mergeDeliveryLists(server, local, todayKey);
    expect(merged).toHaveLength(2);
    expect(merged.some((d) => d.id === "b")).toBe(true);
  });

  it("selectDeliveriesForDate picks today from period when day list is empty", () => {
    const period: DeliveryListItem[] = [
      {
        id: "wa-200",
        grossValue: 200,
        source: "PARTICULAR",
        originName: null,
        occurredAt: `${todayKey}T16:10:00.000Z`,
        distanceKm: null,
      },
    ];
    const picked = selectDeliveriesForDate([], period, todayKey);
    expect(picked).toHaveLength(1);
    expect(picked[0]?.grossValue).toBe(200);
  });

  it("server poll replaces stale local rows (keeps only local-* pending)", () => {
    const server: DeliveryListItem[] = [
      {
        id: "new-100",
        grossValue: 100,
        source: "IFOOD",
        originName: null,
        occurredAt: `${todayKey}T16:04:00.000Z`,
        distanceKm: null,
      },
    ];
    const staleLocal: DeliveryListItem[] = [
      {
        id: "old-25",
        grossValue: 25,
        source: "PARTICULAR",
        originName: null,
        occurredAt: `${todayKey}T15:00:00.000Z`,
        distanceKm: null,
      },
      {
        id: "local-pending",
        grossValue: 50,
        source: "PARTICULAR",
        originName: null,
        occurredAt: `${todayKey}T16:05:00.000Z`,
        distanceKm: null,
      },
    ];
    const merged = mergeDeliveryListsFromServerPoll(
      server,
      staleLocal,
      todayKey,
    );
    expect(merged.map((d) => d.id)).toEqual(["local-pending", "new-100"]);
    expect(merged.find((d) => d.id === "old-25")).toBeUndefined();
  });

  it("hides tombstoned ids even if server still returns them", () => {
    const row: DeliveryListItem = {
      id: "gone",
      grossValue: 25,
      source: "PARTICULAR",
      originName: "x",
      occurredAt: `${todayKey}T14:05:00.000Z`,
      distanceKm: null,
    };
    const merged = mergeDeliveryLists([row], [row], todayKey, new Set(["gone"]));
    expect(merged).toHaveLength(0);
  });
});

describe("mergeTodayFromServer", () => {
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

  it("keeps local totals when user just added a delivery", () => {
    const server = { ...emptyToday, deliveryCount: 1, grossTotal: 25 };
    const local: TodaySummary = {
      ...emptyToday,
      deliveryCount: 2,
      grossTotal: 55,
      netProfit: 55,
      recentDeliveries: [
        {
          id: "b",
          grossValue: 30,
          source: "PARTICULAR",
          originName: "farm",
          occurredAt: `${todayKey}T14:10:00.000Z`,
        },
        {
          id: "a",
          grossValue: 25,
          source: "PARTICULAR",
          originName: "mercado",
          occurredAt: `${todayKey}T14:05:00.000Z`,
        },
      ],
    };
    const merged = mergeTodayFromServer(server, local, new Set(), todayKey);
    expect(merged.deliveryCount).toBe(2);
    expect(merged.grossTotal).toBe(55);
  });
});
