import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { signToken, verifyToken } from "../lib/auth.js";
import { hasAppAccess, type SessionUser } from "../lib/session-user.js";
import { isTrialExpired } from "../services/user.js";

const JWT_SECRET = "test-secret-min-16-chars!!";

function sessionUser(
  overrides: Partial<SessionUser> = {},
): SessionUser {
  return {
    id: "user_active_test",
    whatsappNumber: "5531999998888",
    email: "ativo@test.com",
    name: "Motoboy Ativo",
    status: "ACTIVE",
    trialEndsAt: null,
    subscribedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("usuário ACTIVE (painel ou API) e autenticação", () => {
  it("JWT de motoboy ACTIVE assina e valida igual a qualquer conta", () => {
    const token = signToken(
      { userId: "user_active_test", whatsappNumber: "5531999998888" },
      JWT_SECRET,
    );
    const payload = verifyToken(token, JWT_SECRET);
    expect(payload.userId).toBe("user_active_test");
    expect(payload.role).toBeUndefined();
  });

  it("token inválido só quando o secret difere (não por status ACTIVE)", () => {
    const token = signToken({ userId: "u1" }, JWT_SECRET);
    expect(() => verifyToken(token, "outro-secret-min-16!!")).toThrow();
  });

  it("hasAppAccess libera ACTIVE mesmo com trialEndsAt nulo", () => {
    expect(hasAppAccess(sessionUser({ status: "ACTIVE" }))).toBe(true);
  });

  it("TRIAL expirado bloqueia app; ACTIVE não", () => {
    const expiredTrial = sessionUser({
      status: "TRIAL",
      trialEndsAt: new Date("2020-01-01"),
    });
    expect(hasAppAccess(expiredTrial)).toBe(false);
    expect(
      isTrialExpired({
        status: "ACTIVE",
        trialEndsAt: new Date("2020-01-01"),
      }),
    ).toBe(false);
    expect(
      isTrialExpired({
        status: "TRIAL",
        trialEndsAt: new Date("2020-01-01"),
      }),
    ).toBe(true);
  });

  it("ativar no admin só altera banco — não emite nem invalida JWT", () => {
    const billingPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "../services/admin-billing.ts",
    );
    const src = readFileSync(billingPath, "utf8");
    expect(src).toContain('status: "ACTIVE"');
    expect(src).not.toContain("signToken");
    expect(src).not.toContain("JWT_SECRET");
  });
});
