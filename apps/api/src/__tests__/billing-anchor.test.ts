import { describe, expect, it } from "vitest";
import {
  isAppSubscriptionPayment,
  resolvePaidSubscriptionBilling,
} from "../services/asaas-subscription-schedule.js";

describe("billing anchor override", () => {
  it("pagamento SUBSCRIPTION pelo app sobrepõe subscribedAt do admin", () => {
    const adminDate = new Date(2026, 0, 10, 12, 0, 0);
    const appPaidAt = new Date(2026, 5, 3, 14, 0, 0);

    const result = resolvePaidSubscriptionBilling({
      userId: "u1",
      chargeId: "pay_1",
      paidAt: appPaidAt,
      user: {
        status: "ACTIVE",
        subscribedAt: adminDate,
        asaasSubscriptionId: "sub_admin",
      },
      linkedSubscriptionId: "sub_app",
      chargeKind: "SUBSCRIPTION",
    });

    expect(result.fromApp).toBe(true);
    expect(result.forceOverwrite).toBe(true);
    expect(result.isFirstPayment).toBe(true);
    expect(result.subscribedAtAfter).toEqual(appPaidAt);
  });

  it("cobrança SUPPORT do admin não redefine âncora", () => {
    const adminDate = new Date(2026, 0, 10, 12, 0, 0);
    const paidAt = new Date(2026, 5, 3, 14, 0, 0);

    const result = resolvePaidSubscriptionBilling({
      userId: "u1",
      chargeId: "pay_1",
      paidAt,
      user: {
        status: "TRIAL",
        subscribedAt: adminDate,
        asaasSubscriptionId: "sub_admin",
      },
      linkedSubscriptionId: null,
      chargeKind: "SUPPORT",
      paymentDueDate: "2026-06-03",
    });

    expect(result.fromApp).toBe(false);
    expect(result.forceOverwrite).toBe(false);
    expect(result.subscribedAtAfter).toEqual(adminDate);
  });

  it("detecta pagamento de assinatura pelo vínculo Asaas", () => {
    expect(
      isAppSubscriptionPayment({
        chargeKind: null,
        linkedSubscriptionId: "sub_xyz",
      }),
    ).toBe(true);
    expect(
      isAppSubscriptionPayment({
        chargeKind: "SUPPORT",
        linkedSubscriptionId: "sub_xyz",
      }),
    ).toBe(false);
  });
});
