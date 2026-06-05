import { describe, expect, it } from "vitest";
import { AsaasApiError } from "../lib/asaas-client.js";
import { mapAsaasCheckoutHttpError } from "../lib/asaas-checkout-error.js";

describe("mapAsaasCheckoutHttpError", () => {
  it("maps 401 to ASAAS_AUTH_ERROR", () => {
    const mapped = mapAsaasCheckoutHttpError(
      new AsaasApiError("invalid_access_token", 401),
    );
    expect(mapped?.status).toBe(503);
    expect(mapped?.body.code).toBe("ASAAS_AUTH_ERROR");
  });

  it("maps 400 to client error with ASAAS_ERROR", () => {
    const mapped = mapAsaasCheckoutHttpError(
      new AsaasApiError("CPF inválido", 400),
    );
    expect(mapped?.status).toBe(400);
    expect(mapped?.body.error).toContain("CPF");
  });

  it("maps 504 to ASAAS_TIMEOUT", () => {
    const mapped = mapAsaasCheckoutHttpError(
      new AsaasApiError("Asaas demorou", 504),
    );
    expect(mapped?.status).toBe(504);
    expect(mapped?.body.code).toBe("ASAAS_TIMEOUT");
  });

  it("returns null for non-Asaas errors", () => {
    expect(mapAsaasCheckoutHttpError(new Error("x"))).toBeNull();
  });
});
