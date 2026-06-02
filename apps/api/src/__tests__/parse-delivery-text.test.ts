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
    expect(r?.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it("parses R$ 30 entrega teste as particular", () => {
    const r = tryParseDeliveryFromText("R$ 30 entrega teste");
    expect(r).toMatchObject({
      type: "delivery",
      grossValue: 30,
      source: "PARTICULAR",
    });
  });

  it("parses valor + plataforma sem palavra entrega", () => {
    expect(tryParseDeliveryFromText("40 ifood")).toMatchObject({
      grossValue: 40,
      source: "IFOOD",
    });
    expect(tryParseDeliveryFromText("ifood 35")).toMatchObject({
      grossValue: 35,
      source: "IFOOD",
    });
  });

  it("tolera typo de plataforma e zero (4o)", () => {
    expect(tryParseDeliveryFromText("4o ifud")).toMatchObject({
      grossValue: 40,
      source: "IFOOD",
    });
    expect(tryParseDeliveryFromText("rs 25 rappi")).toMatchObject({
      grossValue: 25,
      source: "RAPPI",
    });
  });

  it("aceita entrega abreviada/errada", () => {
    expect(tryParseDeliveryFromText("30 entrg 99")).toMatchObject({
      grossValue: 30,
      source: "NINETY_NINE",
    });
  });

  it("não confunde abastecimento com entrega", () => {
    expect(tryParseDeliveryFromText("abasteci 50 reais")).toBeNull();
  });

  it("entende 99 e rappi como no áudio (Whisper)", () => {
    expect(tryParseDeliveryFromText("35 noventa e nove")).toMatchObject({
      grossValue: 35,
      source: "NINETY_NINE",
    });
    expect(tryParseDeliveryFromText("28 rapi entrega")).toMatchObject({
      grossValue: 28,
      source: "RAPPI",
    });
    expect(tryParseDeliveryFromText("32 repi")).toMatchObject({
      grossValue: 32,
      source: "RAPPI",
    });
    expect(tryParseDeliveryFromText("entrega 40 noventa nove")).toMatchObject({
      grossValue: 40,
      source: "NINETY_NINE",
    });
  });

  it("comércio local sem app é particular", () => {
    expect(
      tryParseDeliveryFromText("25 entrega da farmacia santa maria"),
    ).toMatchObject({
      grossValue: 25,
      source: "PARTICULAR",
    });
    expect(tryParseDeliveryFromText("30 padaria central")).toMatchObject({
      grossValue: 30,
      source: "PARTICULAR",
    });
    expect(tryParseDeliveryFromText("40 entrega no mercado bom preco")).toMatchObject({
      grossValue: 40,
      source: "PARTICULAR",
    });
  });

  it("does not invent 25 for unrelated text", () => {
    expect(tryParseDeliveryFromText("oi")).toBeNull();
    expect(tryParseDeliveryFromText("valeu")).toBeNull();
  });
});
