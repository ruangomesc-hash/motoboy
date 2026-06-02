import { describe, expect, it } from "vitest";
import { tryParseDeliveryFromText } from "@motoboy/ai";

describe("tryParseDeliveryFromText", () => {
  it("parses R$ 40 entrega ifood", () => {
    const r = tryParseDeliveryFromText("R$ 40 entrega ifood");
    expect(r).toMatchObject({
      type: "delivery",
      grossValue: 40,
      source: "IFOOD",
    });
  });

  it("parses R$ 30 entrega teste as particular", () => {
    const r = tryParseDeliveryFromText("R$ 30 entrega teste");
    expect(r).toMatchObject({
      type: "delivery",
      grossValue: 30,
      source: "PARTICULAR",
    });
  });

  it("does not invent 25 for unrelated text", () => {
    expect(tryParseDeliveryFromText("oi")).toBeNull();
  });
});
