import { describe, expect, it } from "vitest";
import { mapPrismaHttpError } from "../lib/prisma-http.js";

describe("mapPrismaHttpError", () => {
  it("maps P2025 to 404", () => {
    const mapped = mapPrismaHttpError({ code: "P2025" });
    expect(mapped?.status).toBe(404);
    expect(mapped?.body.code).toBe("NOT_FOUND");
  });

  it("maps P2003 to 409", () => {
    const mapped = mapPrismaHttpError({ code: "P2003" });
    expect(mapped?.status).toBe(409);
    expect(mapped?.body.code).toBe("FK_CONFLICT");
  });

  it("maps connection errors to 503", () => {
    const mapped = mapPrismaHttpError({
      name: "PrismaClientInitializationError",
      message: "Can't reach database server",
    });
    expect(mapped?.status).toBe(503);
    expect(mapped?.body.code).toBe("DATABASE_UNAVAILABLE");
  });

  it("maps P2022 passwordHash to migrations hint", () => {
    const mapped = mapPrismaHttpError({
      code: "P2022",
      message: 'column "passwordHash" does not exist',
    });
    expect(mapped?.status).toBe(503);
    expect(mapped?.body.code).toBe("MIGRATIONS_REQUIRED");
    expect(mapped?.body.error).toContain("senha");
  });

  it("returns null for unknown errors", () => {
    expect(mapPrismaHttpError(new Error("boom"))).toBeNull();
  });
});
