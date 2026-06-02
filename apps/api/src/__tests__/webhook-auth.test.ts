import { describe, expect, it } from "vitest";
import {
  evolutionWebhookSecrets,
  verifyEvolutionWebhook,
} from "../lib/webhook-auth.js";
import type { Env } from "@motoboy/types";

describe("verifyEvolutionWebhook", () => {
  const env = {
    EVOLUTION_WEBHOOK_SECRET: "webhook-secret",
    EVOLUTION_API_KEY: "api-key-different",
  } as Env;

  it("accepts either webhook secret or api key", () => {
    process.env.EVOLUTION_WEBHOOK_SECRET = "webhook-secret";
    expect(
      verifyEvolutionWebhook(env, { apikey: "webhook-secret" }),
    ).toBe(true);
    expect(verifyEvolutionWebhook(env, { apikey: "api-key-different" })).toBe(
      true,
    );
    expect(verifyEvolutionWebhook(env, { apikey: "wrong" })).toBe(false);
    delete process.env.EVOLUTION_WEBHOOK_SECRET;
  });

  it("dedupes secrets", () => {
    const envSame = {
      EVOLUTION_WEBHOOK_SECRET: "same",
      EVOLUTION_API_KEY: "same",
    } as Env;
    expect(evolutionWebhookSecrets(envSame)).toEqual(["same"]);
  });
});
