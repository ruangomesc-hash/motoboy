import type {
  AdminAffiliateReferrals,
  AdminAffiliateRow,
  AdminAffiliatesList,
  AdminCreateAffiliateInput,
  AdminCreateUserInput,
  AdminOverview,
  AdminPaymentLinkResponse,
  AdminUsageLogs,
  AdminUserRow,
  AdminUsersList,
} from "@motoboy/types";
import { withUsage } from "@/lib/admin-usage";

export const ADMIN_DEMO_ID = "admin-demo";

function last7DaysSignups(): { date: string; count: number }[] {
  const points: { date: string; count: number }[] = [];
  const counts = [2, 4, 1, 5, 3, 6, 4];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toISOString().slice(0, 10),
      count: counts[6 - i] ?? 2,
    });
  }
  return points;
}

export const demoAdminOverview: AdminOverview = {
  generatedAt: new Date().toISOString(),
  subscriptionPrice: 14.9,
  users: {
    total: 48,
    active: 22,
    trial: 14,
    overdue: 7,
    paused: 3,
    canceled: 2,
    pendingPayment: 4,
  },
  signups: {
    today: 3,
    week: 12,
    month: 28,
    last7Days: last7DaysSignups(),
  },
  revenue: {
    mrr: 22 * 14.9,
    paidThisMonth: 298.0,
    paidCountThisMonth: 20,
  },
  growth: {
    newSubscribersMonth: 8,
    newSubscribersWeek: 3,
    churnedMonth: 2,
    churnRatePercent: 8.3,
    delinquentTotal: 9,
  },
  operations: {
    deliveriesToday: 156,
    deliveriesTotal: 3842,
    activeShifts: 11,
    avgDeliveriesPerActiveUser: 7.1,
  },
  regions: [
    {
      city: "São Paulo",
      total: 18,
      active: 9,
      trial: 5,
      overdue: 2,
      deliveries: 1420,
    },
    {
      city: "Guarulhos",
      total: 8,
      active: 4,
      trial: 2,
      overdue: 1,
      deliveries: 520,
    },
    {
      city: "Osasco",
      total: 6,
      active: 3,
      trial: 2,
      overdue: 1,
      deliveries: 310,
    },
    {
      city: "Campinas",
      total: 5,
      active: 2,
      trial: 2,
      overdue: 1,
      deliveries: 280,
    },
    {
      city: "Santo André",
      total: 4,
      active: 2,
      trial: 1,
      overdue: 1,
      deliveries: 190,
    },
  ],
};

const demoAffiliates: AdminAffiliateRow[] = [
  {
    id: "aff-1",
    name: "Parceiro Zona Leste",
    code: "ZONALESTE",
    active: true,
    phone: "5511999000001",
    email: "zona@parceiro.com",
    notes: null,
    createdAt: "2026-01-10T00:00:00.000Z",
    totalReferrals: 3,
    activeReferrals: 2,
    trialReferrals: 1,
    paidReferrals: 2,
    referralsThisMonth: 2,
    conversionRatePercent: 66.7,
    rank: 1,
  },
  {
    id: "aff-2",
    name: "Influencer Motoboy SP",
    code: "MOTOJOAO",
    active: true,
    phone: null,
    email: null,
    notes: "Instagram",
    createdAt: "2026-02-01T00:00:00.000Z",
    totalReferrals: 2,
    activeReferrals: 1,
    trialReferrals: 1,
    paidReferrals: 1,
    referralsThisMonth: 1,
    conversionRatePercent: 50,
    rank: 2,
  },
];

const demoClients: AdminUserRow[] = [
  withUsage({
    id: "c1",
    name: "Carlos Silva",
    email: "carlos@email.com",
    whatsappNumber: "5511987654321",
    city: "São Paulo",
    affiliateId: "aff-1",
    affiliateName: "Parceiro Zona Leste",
    affiliateCode: "ZONALESTE",
    status: "ACTIVE",
    trialEndsAt: null,
    subscribedAt: "2026-04-10T00:00:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
    deliveryCount: 412,
    lastPaymentStatus: "PAID",
    isDelinquent: false,
    delinquencyReason: null,
    daysOverdue: null,
  }),
  withUsage({
    id: "c2",
    name: "João Pereira",
    email: "joao@email.com",
    whatsappNumber: "5511976543210",
    city: "Guarulhos",
    affiliateId: "aff-2",
    affiliateName: "Influencer Motoboy SP",
    affiliateCode: "MOTOJOAO",
    status: "TRIAL",
    trialEndsAt: "2026-05-20T00:00:00.000Z",
    subscribedAt: null,
    createdAt: "2026-05-12T00:00:00.000Z",
    deliveryCount: 28,
    lastPaymentStatus: null,
    isDelinquent: true,
    delinquencyReason: "trial_expired",
    daysOverdue: 6,
  }),
  withUsage({
    id: "c3",
    name: "Marcos Lima",
    email: "marcos@email.com",
    whatsappNumber: "5511965432109",
    city: "Osasco",
    affiliateId: "aff-1",
    affiliateName: "Parceiro Zona Leste",
    affiliateCode: "ZONALESTE",
    status: "TRIAL",
    trialEndsAt: "2026-06-01T00:00:00.000Z",
    subscribedAt: null,
    createdAt: "2026-05-20T00:00:00.000Z",
    deliveryCount: 15,
    lastPaymentStatus: "PENDING",
    isDelinquent: true,
    delinquencyReason: "payment_pending",
    daysOverdue: null,
  }),
  withUsage({
    id: "c4",
    name: "Rafael Costa",
    email: "rafael@email.com",
    whatsappNumber: "5511954321098",
    city: "São Paulo",
    affiliateId: null,
    affiliateName: null,
    affiliateCode: null,
    status: "ACTIVE",
    trialEndsAt: null,
    subscribedAt: "2026-02-15T00:00:00.000Z",
    createdAt: "2026-01-20T00:00:00.000Z",
    deliveryCount: 589,
    lastPaymentStatus: "PAID",
    isDelinquent: false,
    delinquencyReason: null,
    daysOverdue: null,
  }),
  withUsage({
    id: "c5",
    name: "Pedro Santos",
    email: "pedro@email.com",
    whatsappNumber: "5511943210987",
    city: "Campinas",
    affiliateId: null,
    affiliateName: null,
    affiliateCode: null,
    status: "CANCELED",
    trialEndsAt: null,
    subscribedAt: "2026-01-05T00:00:00.000Z",
    createdAt: "2025-12-01T00:00:00.000Z",
    deliveryCount: 201,
    lastPaymentStatus: "PAID",
    isDelinquent: false,
    delinquencyReason: null,
    daysOverdue: null,
  }),
];

export const demoAdminLogs: AdminUsageLogs = {
  items: [
    {
      id: "log-1",
      userId: "c1",
      userName: "Carlos Silva",
      userPhone: "5511987654321",
      userCity: "São Paulo",
      category: "DELIVERY",
      action: "CREATED",
      title: "Entrega registrada",
      source: "whatsapp",
      changesSummary: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: "log-2",
      userId: "c2",
      userName: "João Pereira",
      userPhone: "5511976543210",
      userCity: "Guarulhos",
      category: "PROFILE",
      action: "UPDATED",
      title: "Perfil atualizado",
      source: "app",
      changesSummary: "Cidade: — → Guarulhos",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "log-3",
      userId: "c4",
      userName: "Rafael Costa",
      userPhone: "5511954321098",
      userCity: "São Paulo",
      category: "GOAL",
      action: "UPDATED",
      title: "Meta mensal atualizada",
      source: "app",
      changesSummary: "Meta: R$ 4.000 → R$ 5.000",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
  total: 3,
  page: 1,
  limit: 40,
};

function normalizeDemoPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  if (digits.length === 11) return `55${digits}`;
  return digits;
}

function demoPaymentLink(client: AdminUserRow): AdminPaymentLinkResponse {
  const invoiceUrl = `https://sandbox.asaas.com/i/demo-${client.id}`;
  const pixCopyPaste =
    "00020126580014br.gov.bcb.pix0136123e456789-e.mock-MOTOCOPILOTO520400005303986540514.905802BR5925Motocopiloto6009SAO PAULO62070503***6304DEMO";
  const whatsappText = `Olá${client.name ? `, ${client.name}` : ""}!\n\nAssinatura *Motocopiloto* — R$ 14,90/mês.\n\n*Pix copia e cola:*\n${pixCopyPaste}\n\n*Link de pagamento:*\n${invoiceUrl}`;
  const digits = client.whatsappNumber.replace(/\D/g, "");
  return {
    paymentId: `demo-pay-${client.id}`,
    invoiceUrl,
    pixCopyPaste,
    amount: 14.9,
    whatsappText,
    whatsappUrl: `https://wa.me/${digits}?text=${encodeURIComponent(whatsappText)}`,
  };
}

export function adminDemoFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const paymentLinkMatch = path.match(
    /^\/admin\/users\/([^/]+)\/payment-link$/,
  );
  if (paymentLinkMatch && options.method === "POST") {
    const client = demoClients.find((c) => c.id === paymentLinkMatch[1]);
    if (!client) return Promise.reject(new Error("Cliente não encontrado"));
    return Promise.resolve(demoPaymentLink(client) as T);
  }

  const activateMatch = path.match(/^\/admin\/users\/([^/]+)\/activate$/);
  if (activateMatch && options.method === "POST") {
    const client = demoClients.find((c) => c.id === activateMatch[1]);
    if (!client) return Promise.reject(new Error("Cliente não encontrado"));
    if (client.status === "ACTIVE") {
      return Promise.reject(new Error("Cliente já está ativo"));
    }
    client.status = "ACTIVE";
    client.subscribedAt = new Date().toISOString();
    client.trialEndsAt = null;
    client.isDelinquent = false;
    client.delinquencyReason = null;
    client.daysOverdue = null;
    client.lastPaymentStatus = "PAID";
    demoAdminOverview.users.active += 1;
    if (client.delinquencyReason) demoAdminOverview.growth.delinquentTotal -= 1;
    return Promise.resolve({ ok: true, status: "ACTIVE" } as T);
  }

  if (path === "/admin/overview" || path.startsWith("/admin/overview")) {
    return Promise.resolve({
      ...demoAdminOverview,
      generatedAt: new Date().toISOString(),
    } as T);
  }

  if (path === "/admin/users" && options.method === "POST") {
    const body = JSON.parse(String(options.body ?? "{}")) as AdminCreateUserInput & {
      email?: string;
    };
    const whatsapp = normalizeDemoPhone(body.whatsappNumber);
    if (demoClients.some((c) => c.whatsappNumber === whatsapp)) {
      return Promise.reject(new Error("WhatsApp já cadastrado"));
    }
    const createdAt = new Date().toISOString();
    const status = body.status ?? "TRIAL";
    const affiliate = body.affiliateCode
      ? demoAffiliates.find((a) => a.code === body.affiliateCode?.toUpperCase())
      : undefined;

    const row = withUsage({
      id: `c-${Date.now()}`,
      name: body.name ?? null,
      email: body.email ?? null,
      whatsappNumber: whatsapp,
      city: body.city ?? null,
      affiliateId: affiliate?.id ?? null,
      affiliateName: affiliate?.name ?? null,
      affiliateCode: affiliate?.code ?? body.affiliateCode?.toUpperCase() ?? null,
      status,
      trialEndsAt:
        status === "ACTIVE"
          ? null
          : new Date(Date.now() + 14 * 86400000).toISOString(),
      subscribedAt: status === "ACTIVE" ? createdAt : null,
      createdAt,
      deliveryCount: 0,
      lastPaymentStatus: null,
      isDelinquent: false,
      delinquencyReason: null,
      daysOverdue: null,
    });
    demoClients.unshift(row);
    if (affiliate) {
      affiliate.totalReferrals += 1;
      affiliate.referralsThisMonth += 1;
      if (status === "TRIAL") affiliate.trialReferrals += 1;
      if (status === "ACTIVE") {
        affiliate.activeReferrals += 1;
        affiliate.paidReferrals += 1;
      }
      affiliate.conversionRatePercent =
        affiliate.totalReferrals > 0
          ? Math.round(
              (affiliate.paidReferrals / affiliate.totalReferrals) * 1000,
            ) / 10
          : 0;
      rerankDemoAffiliates();
    }
    demoAdminOverview.users.total += 1;
    if (status === "ACTIVE") demoAdminOverview.users.active += 1;
    if (status === "TRIAL") demoAdminOverview.users.trial += 1;
    return Promise.resolve(row as T);
  }

  if (path === "/admin/affiliates" && options.method === "POST") {
    const body = JSON.parse(
      String(options.body ?? "{}"),
    ) as AdminCreateAffiliateInput;
    const code = body.code.toUpperCase();
    if (demoAffiliates.some((a) => a.code === code)) {
      return Promise.reject(new Error("Cupom já em uso"));
    }
    const row: AdminAffiliateRow = {
      id: `aff-${Date.now()}`,
      name: body.name,
      code,
      active: true,
      phone: body.phone ?? null,
      email: body.email ?? null,
      notes: body.notes ?? null,
      createdAt: new Date().toISOString(),
      totalReferrals: 0,
      activeReferrals: 0,
      trialReferrals: 0,
      paidReferrals: 0,
      referralsThisMonth: 0,
      conversionRatePercent: 0,
      rank: 0,
    };
    demoAffiliates.push(row);
    rerankDemoAffiliates();
    return Promise.resolve(
      demoAffiliates.find((a) => a.id === row.id)! as T,
    );
  }

  const affiliateReferralsMatch = path.match(
    /^\/admin\/affiliates\/([^/]+)\/referrals$/,
  );
  if (affiliateReferralsMatch) {
    const affiliate = demoAffiliates.find(
      (a) => a.id === affiliateReferralsMatch[1],
    );
    if (!affiliate) return Promise.reject(new Error("Afiliado não encontrado"));
    const items = demoClients
      .filter((c) => c.affiliateId === affiliate.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        whatsappNumber: c.whatsappNumber,
        city: c.city,
        status: c.status,
        createdAt: c.createdAt,
        subscribedAt: c.subscribedAt,
        affiliateCouponCode: c.affiliateCode,
      }));
    return Promise.resolve({
      affiliate: { id: affiliate.id, name: affiliate.name, code: affiliate.code },
      items,
      total: items.length,
    } as T);
  }

  if (path === "/admin/affiliates" || path.startsWith("/admin/affiliates?")) {
    return Promise.resolve({
      items: [...demoAffiliates].sort((a, b) => a.rank - b.rank),
      total: demoAffiliates.length,
    } as T);
  }

  if (path.startsWith("/admin/delinquent")) {
    const items = demoClients.filter((c) => c.isDelinquent);
    return Promise.resolve({
      items,
      total: items.length,
      page: 1,
      limit: 25,
    } as T);
  }

  if (path.startsWith("/admin/users")) {
    const url = new URL(path, "http://local");
    const status = url.searchParams.get("status");
    const items =
      status && status !== "ALL"
        ? demoClients.filter((c) => c.status === status)
        : demoClients;
    return Promise.resolve({
      items,
      total: items.length,
      page: 1,
      limit: 25,
    } as T);
  }

  if (path.startsWith("/admin/logs")) {
    return Promise.resolve(demoAdminLogs as T);
  }

  return Promise.reject(new Error(`[Admin demo] Rota não mockada: ${path}`));
}

function rerankDemoAffiliates() {
  demoAffiliates.sort((a, b) => {
    if (b.totalReferrals !== a.totalReferrals) {
      return b.totalReferrals - a.totalReferrals;
    }
    if (b.paidReferrals !== a.paidReferrals) {
      return b.paidReferrals - a.paidReferrals;
    }
    return b.referralsThisMonth - a.referralsThisMonth;
  });
  demoAffiliates.forEach((a, i) => {
    a.rank = i + 1;
  });
}
