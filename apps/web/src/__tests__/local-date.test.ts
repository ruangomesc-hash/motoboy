import { describe, expect, it } from "vitest";
import {
  advanceDeliveriesFilterAfterMidnight,
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

describe("advanceDeliveriesFilterAfterMidnight", () => {
  const morning = new Date(2026, 5, 10, 8, 0, 0);

  it("advances when the calendar day changed and filter tracked previous today", () => {
    expect(
      advanceDeliveriesFilterAfterMidnight(
        "2026-06-09",
        "2026-06-09",
        morning,
      ),
    ).toBe("2026-06-10");
  });

  it("keeps yesterday when user is reviewing the previous day", () => {
    expect(
      advanceDeliveriesFilterAfterMidnight(
        "2026-06-09",
        "2026-06-10",
        morning,
      ),
    ).toBeNull();
  });

  it("keeps older manual dates", () => {
    expect(
      advanceDeliveriesFilterAfterMidnight(
        "2026-06-05",
        "2026-06-10",
        morning,
      ),
    ).toBeNull();
  });
});
