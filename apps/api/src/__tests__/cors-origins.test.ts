import { describe, expect, it } from "vitest";
import { collectCorsOrigins, isCorsOriginAllowed } from "../lib/cors-origins.js";

describe("cors origins", () => {
  it("allows custom motocopiloto domain", () => {
    const allowed = collectCorsOrigins({
      APP_URL: "https://motocopiloto.vercel.app",
    } as Parameters<typeof collectCorsOrigins>[0]);
    expect(
      isCorsOriginAllowed("https://app.motocopiloto.com.br", allowed),
    ).toBe(true);
  });

  it("allows host from NEXTAUTH_URL env", () => {
    process.env.NEXTAUTH_URL = "https://app.motocopiloto.com.br";
    const allowed = collectCorsOrigins({
      APP_URL: "http://localhost:3002",
    } as Parameters<typeof collectCorsOrigins>[0]);
    expect(
      isCorsOriginAllowed("https://app.motocopiloto.com.br", allowed),
    ).toBe(true);
    delete process.env.NEXTAUTH_URL;
  });
});
