import { describe, expect, it } from "vitest";
import { createPendingDeliveryRegistry } from "@/lib/pending-delivery-registry";

describe("createPendingDeliveryRegistry", () => {
  it("tracks cancelled local deliveries", () => {
    const reg = createPendingDeliveryRegistry();
    reg.mark("local-1");
    expect(reg.hasLocal()).toBe(true);
    reg.markCancelled("local-1");
    expect(reg.isCancelled("local-1")).toBe(true);
    reg.unmark("local-1");
    expect(reg.isCancelled("local-1")).toBe(false);
    expect(reg.hasLocal()).toBe(false);
  });
});
