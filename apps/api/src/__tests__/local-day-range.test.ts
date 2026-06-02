import { describe, expect, it } from "vitest";
import {
  dayRangeFromDateInput,
  dayRangeFromDateInputInclusiveEnd,
} from "../lib/local-day-range.js";

describe("dayRangeFromDateInput (BRT)", () => {
  it("starts at 03:00 UTC for midnight BRT", () => {
    const { start, end } = dayRangeFromDateInput("2026-06-02");
    expect(start.toISOString()).toBe("2026-06-02T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-06-03T03:00:00.000Z");
  });

  it("spans multiple days inclusive", () => {
    const { start, end } = dayRangeFromDateInputInclusiveEnd(
      "2026-06-01",
      "2026-06-02",
    );
    expect(start.toISOString()).toBe("2026-06-01T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-06-03T03:00:00.000Z");
  });
});
