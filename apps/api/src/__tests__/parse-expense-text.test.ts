import { describe, expect, it } from "vitest";
import { tryParseExpenseFromText } from "@motoboy/ai";

describe("tryParseExpenseFromText", () => {
  it("parses despesa com valor e categoria", () => {
    expect(tryParseExpenseFromText("despesa 25 almoco")).toMatchObject({
      type: "expense",
      grossValue: 25,
      originName: "Almoço",
    });
  });

  it("parses gastei no lanche", () => {
    expect(tryParseExpenseFromText("gastei 18 no lanche")).toMatchObject({
      grossValue: 18,
      originName: "Lanche",
    });
  });

  it("parses R$ 30 despesa", () => {
    expect(tryParseExpenseFromText("R$ 30 despesa janta")).toMatchObject({
      grossValue: 30,
      originName: "Janta",
    });
  });

  it("não confunde abastecimento com litros", () => {
    expect(tryParseExpenseFromText("abasteci 50 reais 8 litros")).toBeNull();
  });

  it("não inventa despesa em oi", () => {
    expect(tryParseExpenseFromText("oi")).toBeNull();
  });

  it("não rouba entrega ifood", () => {
    expect(tryParseExpenseFromText("40 ifood")).toBeNull();
  });
});
