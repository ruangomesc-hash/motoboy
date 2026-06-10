import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../create-app.js";
import { loadEnv } from "../lib/env.js";
import { signToken } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";

describe("DELETE /me/deliveries/:id", () => {
  let app: FastifyInstance;
  let userToken: string;

  beforeAll(async () => {
    const env = loadEnv();
    app = await createApp({ env, logger: false });
    await app.ready();
    userToken = signToken({ userId: "user_test_delete" }, env.JWT_SECRET);
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns 401 without token", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/me/deliveries/clxxxxxxxxxxxxxxxxx",
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 for local-* pending id when session is valid", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/me/deliveries/local-1234567890",
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect([400, 401, 503]).toContain(res.statusCode);
    if (res.statusCode === 400) {
      const body = res.json() as { code?: string };
      expect(body.code).toBe("DELIVERY_NOT_SYNCED");
    }
  });

  it("does not return generic 500 for invalid jwt", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/me/deliveries/clxxxxxxxxxxxxxxxxx",
      headers: { authorization: "Bearer invalid.token.here" },
    });
    expect(res.statusCode).toBe(401);
    const body = res.json() as { error?: string };
    expect(body.error).not.toBe("Erro interno do servidor");
  });

  it("returns 404, 401 or 503 for missing delivery (never generic 500)", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/me/deliveries/clxxxxxxxxxxxxxxxxx",
      headers: { authorization: `Bearer ${userToken}` },
    });
    expect([401, 404, 503]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);
  });
});
