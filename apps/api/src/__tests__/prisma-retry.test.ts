import { describe, expect, it, vi } from "vitest";

vi.mock("@motoboy/db", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $connect: vi.fn().mockResolvedValue(undefined),
  },
}));

import {
  isTransientPrismaError,
  withPrismaRetry,
} from "../lib/prisma-retry.js";

describe("isTransientPrismaError", () => {
  it("detects P2024", () => {
    expect(isTransientPrismaError({ code: "P2024" })).toBe(true);
  });

  it("ignores validation errors", () => {
    expect(isTransientPrismaError({ code: "P2002" })).toBe(false);
  });
});

describe("withPrismaRetry", () => {
  it("retries transient failures", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ code: "P2024" })
      .mockResolvedValue("ok");

    await expect(withPrismaRetry(fn, { baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
