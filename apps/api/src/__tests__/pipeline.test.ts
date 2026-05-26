import { describe, it, expect } from "vitest";
import { extractionResultSchema } from "@motocheck/types";

describe("IA extraction schema", () => {
  it("parses delivery JSON", () => {
    const raw = {
      type: "delivery",
      source: "IFOOD",
      grossValue: 12,
      originName: null,
      destinationAddr: null,
      distanceKm: 3,
      confidence: 0.9,
    };
    const result = extractionResultSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("delivery");
      if (result.data.type === "delivery") {
        expect(result.data.source).toBe("IFOOD");
        expect(result.data.grossValue).toBe(12);
      }
    }
  });

  it("parses command JSON", () => {
    const result = extractionResultSchema.safeParse({
      type: "command",
      action: "today_summary",
    });
    expect(result.success).toBe(true);
  });

  it("parses fuel refuel JSON", () => {
    const result = extractionResultSchema.safeParse({
      type: "fuel_refuel",
      totalAmount: 40,
      liters: 6.5,
      confidence: 0.9,
    });
    expect(result.success).toBe(true);
  });

  it("parses odometer JSON", () => {
    const result = extractionResultSchema.safeParse({
      type: "odometer",
      odometerKm: 45820,
      confidence: 0.85,
    });
    expect(result.success).toBe(true);
  });
});
