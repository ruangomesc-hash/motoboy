import { describe, expect, it } from "vitest";
import { normalizePhone, parseLocalPhone } from "../lib/phone.js";

describe("phone normalization", () => {
  it("stores 55 + 11 digits", () => {
    expect(parseLocalPhone("61999999999")).toBe("61999999999");
    expect(normalizePhone("61999999999")).toBe("5561999999999");
  });

  it("rejects 13-digit input without valid local part", () => {
    expect(() => normalizePhone("6199999999999")).toThrow();
  });
});
