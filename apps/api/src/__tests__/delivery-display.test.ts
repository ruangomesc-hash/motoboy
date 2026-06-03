import { describe, expect, it } from "vitest";
import { formatDeliveryRecordLabel } from "@motoboy/types";

describe("formatDeliveryRecordLabel", () => {
  it("mostra origem e local", () => {
    expect(
      formatDeliveryRecordLabel("PARTICULAR", "Cachorro Quente"),
    ).toBe("Particular - Cachorro Quente");
  });

  it("sem local, só origem", () => {
    expect(formatDeliveryRecordLabel("PARTICULAR", null)).toBe("Particular");
    expect(formatDeliveryRecordLabel("IFOOD", "")).toBe("iFood");
  });
});
