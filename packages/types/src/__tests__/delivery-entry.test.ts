import { describe, expect, it } from "vitest";
import { isExpenseEntry, splitDeliveryEntries } from "../delivery-entry";

describe("delivery-entry", () => {
  it("detects expense by negative gross", () => {
    expect(isExpenseEntry(-10)).toBe(true);
    expect(isExpenseEntry(10)).toBe(false);
  });

  it("splits deliveries and manual expenses", () => {
    const split = splitDeliveryEntries([
      { grossValue: 50, distanceKm: 2 },
      { grossValue: -15 },
      { grossValue: 30, distanceKm: 1 },
    ]);
    expect(split.grossTotal).toBe(80);
    expect(split.manualExpenses).toBe(15);
    expect(split.deliveryCount).toBe(2);
    expect(split.totalKm).toBe(3);
  });
});
