import type {
  ActivityLogItem,
  GoalsPlan,
  SubscriptionStatus,
  TodaySummary,
  UserProfile,
  WeeklyGoalProgress,
} from "@motoboy/types";
import {
  applyDeliveryToToday,
  removeDeliveryFromToday,
} from "@/lib/app-data-cache";
import { DEFAULT_WORK_DAYS } from "@/lib/work-days";

export const DEMO_USER_ID = "demo-user";

export const demoProfile: UserProfile = {
  id: DEMO_USER_ID,
  name: "Carlos",
  email: "carlos@email.com",
  city: "São Paulo",
  vehiclePlate: null,
  whatsappNumber: "5511999999999",
  workApps: ["IFOOD", "NINETY_NINE", "PARTICULAR"],
  subscriptionPaymentMethod: "PIX",
  workDays: [...DEFAULT_WORK_DAYS],
};

export const demoCosts = {
  fuelPricePerLiter: 6.2,
  kmPerLiter: 35,
  maintenancePerKm: 0.15,
  dailyFoodCost: 25,
  otherDailyCost: 33,
};

export const demoGoalsPlan: GoalsPlan = {
  monthlyTarget: 5000,
  weeklyTarget: 1153.85,
  dailyTarget: 192.31,
  workDays: [...DEFAULT_WORK_DAYS],
  workDaysInMonth: 26,
  workDaysInWeek: 6,
  monthLabel: "Maio de 2026",
  weekLabel: "26 de mai. – 01 de jun.",
};

export const demoWeeklyGoal: WeeklyGoalProgress = {
  target: demoGoalsPlan.weeklyTarget,
  earned: 892.4,
  expectedByToday: 961.54,
  progress: 892.4 / demoGoalsPlan.weeklyTarget,
  expectedProgress: 961.54 / demoGoalsPlan.weeklyTarget,
  pace: "behind",
  paceAmount: 69.14,
  workDaysTotal: 6,
  workDaysElapsed: 5,
  weekLabel: demoGoalsPlan.weekLabel,
};

export const demoHistory: ActivityLogItem[] = [
  {
    id: "demo-h-1",
    category: "PROFILE",
    action: "UPDATED",
    title: "Perfil atualizado",
    changes: [
      {
        field: "subscriptionPaymentMethod",
        label: "Pagamento da assinatura",
        from: "Pix recorrente",
        to: "Pix recorrente",
      },
    ],
    entityId: null,
    source: "app",
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "demo-h-2",
    category: "GOAL",
    action: "UPDATED",
    title: "Meta do dia alterada",
    changes: [
      {
        field: "targetValue",
        label: "Meta do dia",
        from: "R$ 200,00",
        to: "R$ 250,00",
      },
    ],
    entityId: null,
    source: "app",
    createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    id: "demo-h-3",
    category: "DELIVERY",
    action: "CREATED",
    title: "Entrega via WhatsApp",
    changes: [
      { field: "grossValue", label: "Valor", from: null, to: "R$ 25,00" },
      { field: "source", label: "Origem", from: null, to: "Particular" },
    ],
    entityId: "demo-1",
    source: "whatsapp",
    createdAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: "demo-h-4",
    category: "COSTS",
    action: "UPDATED",
    title: "Custos atualizados",
    changes: [
      {
        field: "otherDailyCost",
        label: "Outros custos/dia",
        from: "R$ 25,00",
        to: "R$ 33,00",
      },
    ],
    entityId: null,
    source: "app",
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];

function pushDemoActivity(
  entry: Omit<ActivityLogItem, "id" | "createdAt"> & { createdAt?: string },
) {
  demoHistory.unshift({
    ...entry,
    id: `demo-h-${Date.now()}`,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  });
}

export const demoSubscription: SubscriptionStatus = {
  status: "TRIAL",
  trialEndsAt: new Date(Date.now() + 4 * 86400_000).toISOString(),
  trialDays: 4,
  subscribedAt: null,
  subscriptionPaymentMethod: "PIX",
  lastPayment: null,
  asaas: {
    configured: false,
    sandbox: true,
    webhookPath: "/api/backend/webhooks/asaas",
  },
};

export const demoToday: TodaySummary = {
  grossTotal: 247.8,
  fuelCost: 39,
  maintenanceCost: 14.4,
  otherCost: 33,
  totalExpenses: 86.4,
  netProfit: 161.4,
  totalKm: 96,
  profitPerKm: 2.17,
  deliveryCount: 8,
  fuel: {
    cost: 39,
    litersToday: 6.5,
    isActual: true,
    lastPricePerLiter: 6.0,
    avgPricePerLiter: 5.92,
    refuelCountToday: 1,
  },
  odometer: {
    currentKm: 45820,
    kmToday: 96,
    kmSource: "odometer",
  },
  goalTarget: demoGoalsPlan.dailyTarget,
  goalProgress: 161.4 / demoGoalsPlan.dailyTarget,
  goalRemaining: Math.max(demoGoalsPlan.dailyTarget - 161.4, 0),
  goalsPlan: demoGoalsPlan,
  weeklyGoal: demoWeeklyGoal,
  recentDeliveries: [
    {
      id: "demo-1",
      grossValue: 25,
      originName: "Farmácia ABC",
      source: "PARTICULAR",
      occurredAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      grossValue: 8,
      originName: null,
      source: "IFOOD",
      occurredAt: new Date(Date.now() - 33 * 60_000).toISOString(),
    },
    {
      id: "demo-3",
      grossValue: 15,
      originName: "Padaria Sul",
      source: "PARTICULAR",
      occurredAt: new Date(Date.now() - 73 * 60_000).toISOString(),
    },
  ],
};

export const demoDeliveries = {
  items: [
    {
      id: "demo-1",
      grossValue: 25,
      originName: "Farmácia ABC",
      source: "PARTICULAR",
      occurredAt: new Date().toISOString(),
      distanceKm: 4.2,
      destinationAddr: "Rua das Flores, 120",
      proofPhotoUrl: null,
      proofLat: null,
      proofLng: null,
    },
    {
      id: "demo-2",
      grossValue: 8,
      originName: null,
      source: "IFOOD",
      occurredAt: new Date(Date.now() - 33 * 60_000).toISOString(),
      distanceKm: 3,
      destinationAddr: "Av. Paulista, 1000",
      proofPhotoUrl: null,
      proofLat: null,
      proofLng: null,
    },
    {
      id: "demo-3",
      grossValue: 15,
      originName: "Padaria Sul",
      source: "PARTICULAR",
      occurredAt: new Date(Date.now() - 73 * 60_000).toISOString(),
      distanceKm: 2.1,
      destinationAddr: null,
      proofPhotoUrl: null,
      proofLat: null,
      proofLng: null,
    },
    {
      id: "demo-4",
      grossValue: 12,
      originName: null,
      source: "IFOOD",
      occurredAt: new Date(Date.now() - 120 * 60_000).toISOString(),
      distanceKm: 2.8,
      destinationAddr: "Rua Augusta, 500",
      proofPhotoUrl: null,
      proofLat: null,
      proofLng: null,
    },
  ],
  total: 4,
  page: 1,
  limit: 20,
};

export function demoFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  if (path === "/me/today") {
    return Promise.resolve(demoToday as T);
  }
  if (path === "/me/subscription") {
    return Promise.resolve(demoSubscription as T);
  }
  if (path === "/me/fuel") {
    return Promise.resolve({
      stats: demoToday.fuel,
      refuels: [
        {
          id: "demo-fuel-1",
          totalAmount: 39,
          liters: 6.5,
          pricePerLiter: 6,
          occurredAt: new Date().toISOString(),
          receiptPhotoUrl: null,
        },
      ],
    } as T);
  }
  if (path === "/me/odometer") {
    return Promise.resolve({
      stats: demoToday.odometer,
      currentKm: 45820,
      readings: [
        {
          id: "demo-odo-1",
          odometerKm: 45724,
          recordedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
          photoUrl: null,
        },
        {
          id: "demo-odo-2",
          odometerKm: 45820,
          recordedAt: new Date().toISOString(),
          photoUrl: null,
        },
      ],
    } as T);
  }
  if (path === "/me/deliveries" && method === "POST") {
    const body = JSON.parse((options.body as string) ?? "{}") as {
      grossValue: number;
      source: string;
      originName?: string | null;
      distanceKm?: number | null;
      occurredAt?: string;
    };
    const occurredAt = body.occurredAt ?? new Date().toISOString();
    const item = {
      id: `demo-${Date.now()}`,
      grossValue: body.grossValue,
      originName: body.originName ?? null,
      source: body.source,
      occurredAt,
      distanceKm: body.distanceKm ?? null,
      destinationAddr: null,
      proofPhotoUrl: null,
      proofLat: null,
      proofLng: null,
    };
    demoDeliveries.items.unshift(
      item as (typeof demoDeliveries.items)[number],
    );
    demoDeliveries.total += 1;
    Object.assign(
      demoToday,
      applyDeliveryToToday(demoToday, {
        id: item.id,
        grossValue: body.grossValue,
        source: body.source,
        originName: body.originName ?? null,
        occurredAt: item.occurredAt,
        distanceKm: body.distanceKm ?? null,
      }),
    );
    pushDemoActivity({
      category: "DELIVERY",
      action: "CREATED",
      title: "Entrega registrada",
      entityId: item.id,
      source: "app",
      changes: [
        {
          field: "grossValue",
          label: "Valor",
          from: null,
          to: `R$ ${body.grossValue.toFixed(2).replace(".", ",")}`,
        },
      ],
    });
    return Promise.resolve(item as T);
  }
  if (path.startsWith("/me/deliveries?") || path === "/me/deliveries") {
    return Promise.resolve(demoDeliveries as T);
  }
  const deliveryMatch = path.match(/^\/me\/deliveries\/([^/]+)$/);
  if (deliveryMatch) {
    const id = deliveryMatch[1];
    const idx = demoDeliveries.items.findIndex((d) => d.id === id);
    if (idx < 0) return Promise.reject(new Error("Não encontrado"));

    if (method === "DELETE") {
      const removed = demoDeliveries.items.splice(idx, 1)[0];
      if (!removed) return Promise.reject(new Error("Não encontrado"));
      demoDeliveries.total = Math.max(0, demoDeliveries.total - 1);
      Object.assign(
        demoToday,
        removeDeliveryFromToday(demoToday, {
          id: removed.id,
          grossValue: removed.grossValue,
          source: removed.source,
          originName: removed.originName,
          occurredAt: removed.occurredAt,
          distanceKm: removed.distanceKm,
        }),
      );
      return Promise.resolve({ ok: true } as T);
    }

    if (method === "PATCH") {
      const body = JSON.parse((options.body as string) ?? "{}") as {
        grossValue?: number;
        originName?: string | null;
        distanceKm?: number | null;
        source?: string;
        occurredAt?: string;
      };
      const item = demoDeliveries.items[idx];
      if (!item) return Promise.reject(new Error("Não encontrado"));
      const prev = { ...item };
      if (body.grossValue != null) item.grossValue = body.grossValue;
      if (body.originName !== undefined) item.originName = body.originName;
      if (body.distanceKm !== undefined) {
        (item as { distanceKm: number | null }).distanceKm = body.distanceKm;
      }
      if (body.source) item.source = body.source;
      if (body.occurredAt) item.occurredAt = body.occurredAt;

      Object.assign(
        demoToday,
        removeDeliveryFromToday(demoToday, {
          id: prev.id,
          grossValue: prev.grossValue,
          source: prev.source,
          originName: prev.originName,
          occurredAt: prev.occurredAt,
          distanceKm: prev.distanceKm,
        }),
      );
      Object.assign(
        demoToday,
        applyDeliveryToToday(demoToday, {
          id: item.id,
          grossValue: Number(item.grossValue),
          source: item.source,
          originName: item.originName,
          occurredAt: item.occurredAt,
          distanceKm: item.distanceKm,
        }),
      );
      return Promise.resolve({ ...item } as T);
    }

    return Promise.resolve({ ...demoDeliveries.items[idx] } as T);
  }
  if (path.startsWith("/me/stats")) {
    const hoursWorked = 28.5;
    const totalGross = 1707.8;
    const totalNet = 1420;
    return Promise.resolve({
      period: path.includes("month") ? "month" : "week",
      series: [
        { date: "2026-05-20", gross: 180 },
        { date: "2026-05-21", gross: 220 },
        { date: "2026-05-22", gross: 195 },
        { date: "2026-05-23", gross: 310 },
        { date: "2026-05-24", gross: 265 },
        { date: "2026-05-25", gross: 290 },
        { date: "2026-05-26", gross: 247.8 },
      ],
      totalGross,
      totalNet,
      count: 42,
      totalKm: 412,
      hoursWorked,
      grossPerHour: totalGross / hoursWorked,
      netPerHour: totalNet / hoursWorked,
      activeShift: null,
    } as T);
  }
  if (path === "/me") {
    return Promise.resolve({
      id: DEMO_USER_ID,
      name: demoProfile.name,
      whatsappNumber: demoProfile.whatsappNumber,
      profile: demoProfile,
      goalsPlan: demoGoalsPlan,
      costs: { ...demoCosts },
      goals: [{ targetValue: demoGoalsPlan.monthlyTarget, period: "MONTHLY" }],
    } as T);
  }
  if (path.startsWith("/me/history")) {
    const url = new URL(path, "http://local");
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 30);
    const start = (page - 1) * limit;
    const slice = demoHistory.slice(start, start + limit);
    return Promise.resolve({
      items: slice,
      total: demoHistory.length,
      page,
      limit,
    } as T);
  }
  if (path === "/me/profile" && method === "PUT") {
    const body = JSON.parse((options.body as string) ?? "{}") as Partial<
      typeof demoProfile
    > & {
      workApps?: UserProfile["workApps"];
      subscriptionPaymentMethod?: UserProfile["subscriptionPaymentMethod"];
    };
    const changes: ActivityLogItem["changes"] = [];
    if (body.email !== undefined && body.email !== demoProfile.email) {
      changes.push({
        field: "email",
        label: "E-mail",
        from: demoProfile.email,
        to: body.email,
      });
      demoProfile.email = body.email;
    }
    if (body.name !== undefined && body.name !== demoProfile.name) {
      changes.push({
        field: "name",
        label: "Nome",
        from: demoProfile.name,
        to: body.name,
      });
      demoProfile.name = body.name;
    }
    if (body.city !== undefined && body.city !== demoProfile.city) {
      changes.push({
        field: "city",
        label: "Cidade",
        from: demoProfile.city,
        to: body.city,
      });
      demoProfile.city = body.city ?? null;
    }
    if (body.workDays) {
      changes.push({
        field: "workDays",
        label: "Dias trabalhados",
        from: demoProfile.workDays.join(", "),
        to: body.workDays.join(", "),
      });
      demoProfile.workDays = body.workDays;
    }
    if (body.workApps) {
      changes.push({
        field: "workApps",
        label: "Apps",
        from: demoProfile.workApps.join(", "),
        to: body.workApps.join(", "),
      });
      demoProfile.workApps = body.workApps;
    }
    if (body.subscriptionPaymentMethod) {
      changes.push({
        field: "subscriptionPaymentMethod",
        label: "Pagamento da assinatura",
        from: demoProfile.subscriptionPaymentMethod,
        to: body.subscriptionPaymentMethod,
      });
      demoProfile.subscriptionPaymentMethod = body.subscriptionPaymentMethod;
    }
    if (changes.length > 0) {
      pushDemoActivity({
        category: "PROFILE",
        action: "UPDATED",
        title: "Perfil atualizado",
        changes,
        entityId: null,
        source: "app",
      });
    }
    return Promise.resolve(demoProfile as T);
  }
  if (path === "/me/costs" && method === "PUT") {
    const body = JSON.parse((options.body as string) ?? "{}") as Partial<
      typeof demoCosts
    >;
    if (body.fuelPricePerLiter != null) {
      demoCosts.fuelPricePerLiter = body.fuelPricePerLiter;
    }
    if (body.kmPerLiter != null) demoCosts.kmPerLiter = body.kmPerLiter;
    if (body.maintenancePerKm != null) {
      demoCosts.maintenancePerKm = body.maintenancePerKm;
    }
    if (body.dailyFoodCost != null) demoCosts.dailyFoodCost = body.dailyFoodCost;
    if (body.otherDailyCost != null) {
      demoCosts.otherDailyCost = body.otherDailyCost;
    }
    pushDemoActivity({
      category: "COSTS",
      action: "UPDATED",
      title: "Custos atualizados",
      changes: [
        {
          field: "otherDailyCost",
          label: "Outros custos/dia",
          from: null,
          to: `R$ ${demoCosts.otherDailyCost.toFixed(2).replace(".", ",")}`,
        },
      ],
      entityId: null,
      source: "app",
    });
    return Promise.resolve({ ...demoCosts } as T);
  }
  if (path === "/me/goals/plan" && method === "PUT") {
    const body = JSON.parse((options.body as string) ?? "{}") as {
      monthlyTarget?: number;
      workDays?: number[];
    };
    if (body.monthlyTarget) demoGoalsPlan.monthlyTarget = body.monthlyTarget;
    if (body.workDays) {
      demoProfile.workDays = body.workDays;
      demoGoalsPlan.workDays = body.workDays;
    }
    return Promise.resolve({ plan: demoGoalsPlan } as T);
  }
  if (path === "/me/goals" && method === "PUT") {
    const body = JSON.parse((options.body as string) ?? "{}") as {
      targetValue?: number;
    };
    pushDemoActivity({
      category: "GOAL",
      action: "UPDATED",
      title: "Meta do dia alterada",
      changes: [
        {
          field: "targetValue",
          label: "Meta do dia",
          from: "R$ 250,00",
          to: `R$ ${Number(body.targetValue ?? 250).toFixed(2).replace(".", ",")}`,
        },
      ],
      entityId: null,
      source: "app",
    });
    return Promise.resolve({ ok: true } as T);
  }
  if (path === "/me/routes/optimize" && method === "POST") {
    const body = JSON.parse((options.body as string) ?? "{}") as {
      addresses?: string[];
    };
    const addresses = (body.addresses ?? []).map((a) => a.trim()).filter(Boolean);
    if (addresses.length < 2) {
      return Promise.reject(new Error("Informe pelo menos 2 endereços."));
    }
    const invalid = addresses.filter(
      (a) =>
        a.length < 8 ||
        (/^[a-zA-Z0-9]+$/i.test(a) && !/\d/.test(a) && a.length < 12),
    );
    if (invalid.length > 0) {
      return Promise.reject(
        new Error(
          "Endereço inválido no demo. Use rua, número e cidade (ex.: Av. Paulista, 1000, São Paulo).",
        ),
      );
    }
    return Promise.resolve({
      orderedAddresses: addresses,
      totalKm: 12.4,
      totalMin: 28,
      googleMapsUrl: `https://www.google.com/maps/dir/${addresses.map(encodeURIComponent).join("/")}`,
      wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(addresses[0]!)}&navigate=yes`,
      source: "google",
    } as T);
  }
  if (method === "PUT" || method === "PATCH" || method === "DELETE" || method === "POST") {
    return Promise.resolve({ ok: true } as T);
  }

  return Promise.reject(new Error(`Demo: rota não mockada (${path})`));
}
