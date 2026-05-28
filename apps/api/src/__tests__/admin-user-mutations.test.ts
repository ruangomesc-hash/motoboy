import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../create-app.js";
import { loadEnv } from "../lib/env.js";
import { signAdminToken } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";

describe("admin user password & delete routes", () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    const env = loadEnv();
    app = await createApp({ env, logger: false });
    await app.ready();
    adminToken = signAdminToken(env.JWT_SECRET);
  });

  afterAll(async () => {
    await app.close();
  });

  it("PUT /admin/users/:id/password returns 401 without token", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/admin/users/user_test/password",
      headers: { "content-type": "application/json" },
      payload: { password: "12345678" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("PUT /admin/users/:id/password returns 400 for short password", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/admin/users/user_test/password",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      payload: { password: "123" },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { code?: string };
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("DELETE /admin/users/:id returns 401 without token", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/admin/users/user_test",
    });
    expect(res.statusCode).toBe(401);
  });

  it("DELETE with invalid token does not return generic 500", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/admin/users/user_test",
      headers: { authorization: "Bearer invalid.token.here" },
    });
    expect(res.statusCode).toBe(401);
    const body = res.json() as { error?: string };
    expect(body.error).not.toBe("Erro interno do servidor");
  });
});
