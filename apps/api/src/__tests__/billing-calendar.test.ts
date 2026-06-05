import { describe, expect, it } from "vitest";
import {
  addMonthsPreserveDay,
  formatAsaasDueDate,
  isPaymentSettledAfterDueDate,
  nextDueDateAfterPayment,
  nextDueDateOnBillingDay,
} from "../lib/billing-calendar.js";

describe("billing-calendar", () => {
  it("nextDueDateAfterPayment adds one month on same day", () => {
    const paid = new Date(2026, 4, 5, 15, 0, 0); // 05/05/2026
    expect(nextDueDateAfterPayment(paid)).toBe("2026-06-05");
  });

  it("addMonthsPreserveDay clamps day 31 to last day of month", () => {
    const jan31 = new Date(2026, 0, 31, 12, 0, 0);
    const feb = addMonthsPreserveDay(jan31, 1);
    expect(formatAsaasDueDate(feb)).toBe("2026-02-28");
  });

  it("nextDueDateOnBillingDay keeps anchor day after first payment", () => {
    const anchor = new Date(2026, 4, 5, 12, 0, 0); // 05/05
    const after = new Date(2026, 4, 6, 12, 0, 0); // 06/05
    expect(nextDueDateOnBillingDay(anchor, after)).toBe("2026-06-05");
  });

  it("nextDueDateOnBillingDay advances when anchor month already passed", () => {
    const anchor = new Date(2026, 4, 5, 12, 0, 0); // 05/05
    const after = new Date(2026, 5, 10, 12, 0, 0); // 10/06
    expect(nextDueDateOnBillingDay(anchor, after)).toBe("2026-07-05");
  });

  it("detects overdue settlement after due date", () => {
    const paidAt = new Date(2026, 5, 10, 12, 0, 0);
    expect(isPaymentSettledAfterDueDate(paidAt, "2026-06-05")).toBe(true);
    expect(isPaymentSettledAfterDueDate(paidAt, "2026-06-10")).toBe(false);
  });
});
