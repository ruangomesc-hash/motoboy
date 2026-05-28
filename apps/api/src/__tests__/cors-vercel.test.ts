import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../create-app.js";
import { loadEnv } from "../lib/env.js";
import { signAdminToken } from "../lib/auth.js";
import type { FastifyInstance } from "fastify";

describe("CORS with browser Origin on Vercel", () => {
  let app: FastifyInstance;
  let adminToken: string;
  const prevVercel = process.env.VERCEL;

  beforeAll(async () => {
    const env = loadEnv();
    process.env.VERCEL = "1";
    app = await createApp({ env, logger: false });
    await app.ready();
    adminToken = signAdminToken(env.JWT_SECRET);
  });

  afterEach(() => {
    process.env.VERCEL = prevVercel;
  });

  it("GET /health does not fail with CORS error when Origin is set", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://app.motocopiloto.com.br" },
    });
    expect(res.statusCode).not.toBe(500);
    expect(res.body).not.toContain("CORS não permitido");
  });

  it("POST /admin/users does not return generic 500 for CORS", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/admin/users",
      headers: {
        authorization: `Bearer ${adminToken}`,
        origin: "https://app.motocopiloto.com.br",
        "content-type": "application/json",
      },
      payload: {
        whatsappNumber: "61999998888",
        name: "cors-origin-test",
      },
    });
    expect(res.statusCode).not.toBe(500);
    const body = res.json() as { error?: string; code?: string };
    expect(body.error).not.toBe("Erro interno do servidor");
    expect(body.code).not.toBe("INTERNAL_ERROR");
  });
});
