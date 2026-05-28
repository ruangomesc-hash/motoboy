import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readService(name: string): string {
  return readFileSync(join(root, "services", name), "utf8");
}

describe("user data linkage (static audit)", () => {
  it("cadastro público cria User + CostConfig + Goal no mesmo create", () => {
    const src = readService("user.ts");
    expect(src).toContain("defaultUserNestedCreate()");
    expect(src).toContain("costs: { create: {} }");
    expect(src).toContain('period: "DAILY"');
  });

  it("admin create usa o mesmo baseline de custos e meta", () => {
    const src = readService("admin-metrics.ts");
    expect(src).toContain("defaultUserNestedCreate()");
    expect(src).toContain("attachReferralToUser");
  });

  it("entregas sempre gravam userId na tabela Delivery", () => {
    const src = readService("delivery.ts");
    expect(src).toMatch(/userId,\s*\n\s*source:/);
    expect(src).not.toMatch(/userId:\s*undefined/);
  });

  it("rotas /me usam sessionUser.id do JWT", () => {
    const src = readFileSync(join(root, "routes", "me.ts"), "utf8");
    expect(src).toContain("request.sessionUser!.id");
    expect(src).toContain('where: { userId }');
    expect(src).toContain("createDeliveryManual(userId");
  });
});
