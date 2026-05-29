import { describe, expect, it } from "vitest";
import {
  resolveDeliveriesFilterDate,
  todayDateInputValue,
  yesterdayDateInputValue,
} from "@/lib/local-date";

describe("resolveDeliveriesFilterDate", () => {
  const today = new Date(2026, 4, 29, 12, 0, 0);

  it("returns today when cache is empty", () => {
    expect(resolveDeliveriesFilterDate(undefined, today)).toBe(
      todayDateInputValue(today),
    );
  });

  it("advances yesterday cache to today after midnight", () => {
    const yesterday = yesterdayDateInputValue(today);
    expect(resolveDeliveriesFilterDate(yesterday, today)).toBe(
      todayDateInputValue(today),
    );
  });

  it("keeps today when cache is today", () => {
    const key = todayDateInputValue(today);
    expect(resolveDeliveriesFilterDate(key, today)).toBe(key);
  });

  it("preserves older manual dates", () => {
    expect(resolveDeliveriesFilterDate("2026-05-20", today)).toBe("2026-05-20");
  });
});
