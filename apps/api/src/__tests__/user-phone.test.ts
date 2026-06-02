import { describe, expect, it } from "vitest";
import { resolvePhoneLookupKeys } from "../services/user.js";

describe("resolvePhoneLookupKeys", () => {
  it("inclui variante com e sem o 9 do celular", () => {
    const keys = resolvePhoneLookupKeys("5531987654321");
    expect(keys).toContain("5531987654321");
    expect(keys).toContain("553187654321");
  });

  it("aceita número antigo no banco (sem 9) e encontra pelo Zap (com 9)", () => {
    const stored = resolvePhoneLookupKeys("553187654321");
    const fromZap = resolvePhoneLookupKeys("5531987654321");
    expect(stored.some((k) => fromZap.includes(k))).toBe(true);
  });

  it("normaliza JID do Evolution", () => {
    const keys = resolvePhoneLookupKeys("5531999988888@s.whatsapp.net");
    expect(keys).toContain("5531999988888");
  });

  it("inclui 11 dígitos locais sem 55 (cadastro antigo no banco)", () => {
    const keys = resolvePhoneLookupKeys("5531999988888");
    expect(keys).toContain("31999988888");
  });

  it("encontra conta legada (11 dígitos) a partir do Zap (55+11)", () => {
    const legacy = resolvePhoneLookupKeys("31999988888");
    const fromZap = resolvePhoneLookupKeys("5531999988888");
    expect(legacy.some((k) => fromZap.includes(k))).toBe(true);
  });
});
