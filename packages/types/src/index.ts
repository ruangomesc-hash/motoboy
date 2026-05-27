import { z } from "zod";

export const deliverySourceSchema = z.enum([
  "IFOOD",
  "NINETY_NINE",
  "RAPPI",
  "PARTICULAR",
  "OTHER",
]);

/** Como o motoboy prefere pagar a assinatura Motocopiloto (Asaas). */
export const subscriptionPaymentMethodSchema = z.enum([
  "PIX",
  "CREDIT_CARD",
  "BOLETO",
]);

export type SubscriptionPaymentMethod = z.infer<
  typeof subscriptionPaymentMethodSchema
>;
export type DeliverySource = z.infer<typeof deliverySourceSchema>;

export const workDaySchema = z.number().int().min(0).max(6);

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
  city: z.string().trim().max(80).nullable().optional(),
  vehiclePlate: z.string().trim().max(10).nullable().optional(),
  workApps: z.array(deliverySourceSchema).optional(),
  subscriptionPaymentMethod: subscriptionPaymentMethodSchema.optional(),
  workDays: z.array(workDaySchema).min(1).max(7).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  city: z.string().nullable(),
  vehiclePlate: z.string().nullable(),
  whatsappNumber: z.string(),
  workApps: z.array(deliverySourceSchema),
  subscriptionPaymentMethod: subscriptionPaymentMethodSchema,
  workDays: z.array(workDaySchema),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const extractionDeliverySchema = z.object({
  type: z.literal("delivery"),
  source: deliverySourceSchema,
  grossValue: z.number(),
  originName: z.string().nullable(),
  destinationAddr: z.string().nullable(),
  distanceKm: z.number().nullable(),
  confidence: z.number().min(0).max(1),
});

export const extractionRouteSchema = z.object({
  type: z.literal("route_request"),
  addresses: z.array(z.string()).min(1),
});

export const extractionCommandSchema = z.object({
  type: z.literal("command"),
  action: z.enum([
    "start_shift",
    "end_shift",
    "today_summary",
    "week_summary",
    "delete_last",
  ]),
});

export const extractionConfigSchema = z.object({
  type: z.literal("config"),
  key: z.enum(["fuel_price", "daily_goal", "weekly_goal"]),
  value: z.number(),
});

export const extractionFuelRefuelSchema = z.object({
  type: z.literal("fuel_refuel"),
  totalAmount: z.number().positive(),
  liters: z.number().positive(),
  confidence: z.number().min(0).max(1),
});

export const extractionOdometerSchema = z.object({
  type: z.literal("odometer"),
  odometerKm: z.number().positive(),
  confidence: z.number().min(0).max(1),
});

export const extractionUnknownSchema = z.object({
  type: z.literal("unknown"),
  originalText: z.string(),
});

export const extractionResultSchema = z.discriminatedUnion("type", [
  extractionDeliverySchema,
  extractionRouteSchema,
  extractionCommandSchema,
  extractionConfigSchema,
  extractionFuelRefuelSchema,
  extractionOdometerSchema,
  extractionUnknownSchema,
]);

export type ExtractionResult = z.infer<typeof extractionResultSchema>;

export const visionDeliveryDataSchema = z.object({
  type: z.literal("delivery_data"),
  grossValue: z.number(),
  originName: z.string().nullable(),
  destinationAddr: z.string().nullable(),
});

export const visionDeliveryProofSchema = z.object({
  type: z.literal("delivery_proof"),
  description: z.string(),
});

export const visionFuelReceiptSchema = z.object({
  type: z.literal("fuel_receipt"),
  totalAmount: z.number().positive(),
  liters: z.number().positive(),
});

export const visionDashboardOdometerSchema = z.object({
  type: z.literal("dashboard_odometer"),
  odometerKm: z.number().positive(),
});

export const visionUnknownSchema = z.object({
  type: z.literal("unknown"),
});

export const visionResultSchema = z.discriminatedUnion("type", [
  visionDeliveryDataSchema,
  visionDeliveryProofSchema,
  visionFuelReceiptSchema,
  visionDashboardOdometerSchema,
  visionUnknownSchema,
]);

export type VisionResult = z.infer<typeof visionResultSchema>;

export const fuelDayStatsSchema = z.object({
  cost: z.number(),
  litersToday: z.number(),
  isActual: z.boolean(),
  lastPricePerLiter: z.number().nullable(),
  avgPricePerLiter: z.number().nullable(),
  refuelCountToday: z.number(),
});

export const odometerDayStatsSchema = z.object({
  currentKm: z.number().nullable(),
  kmToday: z.number().nullable(),
  kmSource: z.enum(["odometer", "deliveries", "estimate"]),
});

/** Meta mensal + dias trabalhados (semana/dia calculados no calendário real). */
export const goalsPlanUpdateSchema = z.object({
  monthlyTarget: z.number().positive(),
  workDays: z.array(workDaySchema).min(1).max(7).optional(),
});

export const goalsPlanSchema = z.object({
  monthlyTarget: z.number(),
  weeklyTarget: z.number(),
  dailyTarget: z.number(),
  workDays: z.array(workDaySchema),
  workDaysInMonth: z.number(),
  workDaysInWeek: z.number(),
  monthLabel: z.string(),
  weekLabel: z.string(),
});

export const weeklyGoalProgressSchema = z.object({
  target: z.number(),
  earned: z.number(),
  expectedByToday: z.number(),
  progress: z.number(),
  expectedProgress: z.number(),
  pace: z.enum(["ahead", "on_track", "behind"]),
  paceAmount: z.number(),
  workDaysTotal: z.number(),
  workDaysElapsed: z.number(),
  weekLabel: z.string(),
});

export type GoalsPlan = z.infer<typeof goalsPlanSchema>;
export type WeeklyGoalProgress = z.infer<typeof weeklyGoalProgressSchema>;

export const todaySummarySchema = z.object({
  grossTotal: z.number(),
  fuelCost: z.number(),
  maintenanceCost: z.number(),
  otherCost: z.number(),
  totalExpenses: z.number(),
  netProfit: z.number(),
  totalKm: z.number(),
  profitPerKm: z.number(),
  deliveryCount: z.number(),
  fuel: fuelDayStatsSchema,
  odometer: odometerDayStatsSchema,
  goalTarget: z.number().nullable(),
  goalProgress: z.number().nullable(),
  goalRemaining: z.number().nullable(),
  goalsPlan: goalsPlanSchema.nullable(),
  weeklyGoal: weeklyGoalProgressSchema.nullable(),
  recentDeliveries: z.array(
    z.object({
      id: z.string(),
      grossValue: z.number(),
      originName: z.string().nullable(),
      source: deliverySourceSchema,
      occurredAt: z.string(),
    }),
  ),
});

export type FuelDayStats = z.infer<typeof fuelDayStatsSchema>;
export type OdometerDayStats = z.infer<typeof odometerDayStatsSchema>;
export type TodaySummary = z.infer<typeof todaySummarySchema>;

const emptyToUndefined = (val: unknown) => {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
};

export const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")),
  DIRECT_URL: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .url()
      .or(z.string().startsWith("postgresql://"))
      .optional(),
  ),
  REDIS_URL: z.preprocess(
    emptyToUndefined,
    z.string().optional().default("redis://localhost:6379"),
  ),
  EVOLUTION_API_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  EVOLUTION_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  EVOLUTION_INSTANCE: z.preprocess(emptyToUndefined, z.string().optional()),
  EVOLUTION_BOT_NUMBER: z.preprocess(emptyToUndefined, z.string().optional()),
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  GOOGLE_MAPS_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  ASAAS_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  ASAAS_WEBHOOK_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  ASAAS_SANDBOX: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  JWT_SECRET: z.string().min(16),
  API_URL: z.string().default("http://localhost:3001"),
  APP_URL: z.string().default("http://localhost:3002"),
  PORT: z.coerce.number().default(3001),
  ADMIN_EMAIL: z.preprocess(
    emptyToUndefined,
    z.string().email().optional(),
  ),
  ADMIN_PASSWORD: z.preprocess(
    emptyToUndefined,
    z.string().min(8).optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;

export const whatsappRequestSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const affiliateCodeFieldSchema = z
  .string()
  .trim()
  .min(2)
  .max(32)
  .regex(/^[A-Za-z0-9_-]+$/, "Cupom inválido")
  .transform((v) => v.toUpperCase());

export const registerRequestSchema = z.object({
  phone: z.string().min(10).max(15),
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  affiliateCode: affiliateCodeFieldSchema.optional(),
});

export const whatsappVerifySchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
  affiliateCode: affiliateCodeFieldSchema.optional(),
});

export const affiliateValidateResponseSchema = z.object({
  valid: z.boolean(),
  name: z.string().nullable(),
  code: z.string().nullable(),
});

export const subscribeResponseSchema = z.object({
  checkoutUrl: z.string(),
  chargeId: z.string(),
  invoiceUrl: z.string(),
  pixCopyPaste: z.string().nullable(),
  amount: z.number(),
  subscriptionId: z.string().optional(),
});

export type SubscribeResponse = z.infer<typeof subscribeResponseSchema>;

export const subscriptionStatusSchema = z.object({
  status: z.enum(["TRIAL", "ACTIVE", "PAUSED", "CANCELED"]),
  trialEndsAt: z.string().nullable(),
  subscribedAt: z.string().nullable(),
  subscriptionPaymentMethod: subscriptionPaymentMethodSchema,
  lastPayment: z
    .object({
      id: z.string(),
      status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
      amount: z.number(),
      createdAt: z.string(),
      paidAt: z.string().nullable(),
    })
    .nullable(),
  asaas: z.object({
    configured: z.boolean(),
    sandbox: z.boolean(),
    webhookPath: z.string(),
  }),
});

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const costUpdateSchema = z.object({
  fuelPricePerLiter: z.number().positive().optional(),
  kmPerLiter: z.number().positive().optional(),
  maintenancePerKm: z.number().nonnegative().optional(),
  otherDailyCost: z.number().nonnegative().optional(),
});

export const goalUpdateSchema = z.object({
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  targetValue: z.number().positive(),
});

export const deliveryPatchSchema = z.object({
  grossValue: z.number().positive().optional(),
  originName: z.string().nullable().optional(),
  distanceKm: z.number().nonnegative().nullable().optional(),
  source: deliverySourceSchema.optional(),
});

export const deliveryCreateSchema = z.object({
  grossValue: z.number().positive(),
  source: deliverySourceSchema.default("PARTICULAR"),
  originName: z.string().nullable().optional(),
  destinationAddr: z.string().nullable().optional(),
  distanceKm: z.number().nonnegative().nullable().optional(),
  occurredAt: z.string().optional(),
});

export type DeliveryCreateInput = z.infer<typeof deliveryCreateSchema>;

export const periodStatsSchema = z.object({
  period: z.enum(["week", "month"]),
  series: z.array(z.object({ date: z.string(), gross: z.number() })),
  totalGross: z.number(),
  totalNet: z.number(),
  count: z.number(),
  totalKm: z.number(),
  hoursWorked: z.number(),
  grossPerHour: z.number().nullable(),
  netPerHour: z.number().nullable(),
  activeShift: z
    .object({
      id: z.string(),
      startedAt: z.string(),
    })
    .nullable(),
});

export type PeriodStats = z.infer<typeof periodStatsSchema>;

export const activityChangeSchema = z.object({
  field: z.string(),
  label: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable(),
});

export const activityLogItemSchema = z.object({
  id: z.string(),
  category: z.enum([
    "PROFILE",
    "COSTS",
    "GOAL",
    "DELIVERY",
    "FUEL",
    "ODOMETER",
    "SHIFT",
  ]),
  action: z.enum(["CREATED", "UPDATED", "DELETED"]),
  title: z.string(),
  changes: z.array(activityChangeSchema),
  entityId: z.string().nullable(),
  source: z.enum(["app", "whatsapp"]),
  createdAt: z.string(),
});

export const activityHistorySchema = z.object({
  items: z.array(activityLogItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type ActivityChange = z.infer<typeof activityChangeSchema>;
export type ActivityLogItem = z.infer<typeof activityLogItemSchema>;
export type ActivityHistory = z.infer<typeof activityHistorySchema>;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminSignupPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const adminRegionRowSchema = z.object({
  city: z.string(),
  total: z.number(),
  active: z.number(),
  trial: z.number(),
  overdue: z.number(),
  deliveries: z.number(),
});

export const adminOverviewSchema = z.object({
  generatedAt: z.string(),
  subscriptionPrice: z.number(),
  users: z.object({
    total: z.number(),
    active: z.number(),
    trial: z.number(),
    overdue: z.number(),
    paused: z.number(),
    canceled: z.number(),
    pendingPayment: z.number(),
  }),
  signups: z.object({
    today: z.number(),
    week: z.number(),
    month: z.number(),
    last7Days: z.array(adminSignupPointSchema),
  }),
  revenue: z.object({
    mrr: z.number(),
    paidThisMonth: z.number(),
    paidCountThisMonth: z.number(),
  }),
  growth: z.object({
    newSubscribersMonth: z.number(),
    newSubscribersWeek: z.number(),
    churnedMonth: z.number(),
    churnRatePercent: z.number(),
    delinquentTotal: z.number(),
  }),
  operations: z.object({
    deliveriesToday: z.number(),
    deliveriesTotal: z.number(),
    activeShifts: z.number(),
    avgDeliveriesPerActiveUser: z.number(),
  }),
  regions: z.array(adminRegionRowSchema),
});

export const adminAffiliateRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  active: z.boolean(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  totalReferrals: z.number(),
  activeReferrals: z.number(),
  trialReferrals: z.number(),
  paidReferrals: z.number(),
  referralsThisMonth: z.number(),
  conversionRatePercent: z.number(),
  rank: z.number(),
});

export const adminAffiliatesListSchema = z.object({
  items: z.array(adminAffiliateRowSchema),
  total: z.number(),
});

export const adminCreateAffiliateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  code: affiliateCodeFieldSchema,
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const adminUpdateAffiliateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  active: z.boolean().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  email: z.string().trim().email().max(120).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const adminAffiliateReferralRowSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  whatsappNumber: z.string(),
  city: z.string().nullable(),
  status: z.enum(["TRIAL", "ACTIVE", "PAUSED", "CANCELED"]),
  createdAt: z.string(),
  subscribedAt: z.string().nullable(),
  affiliateCouponCode: z.string().nullable(),
});

export const adminAffiliateReferralsSchema = z.object({
  affiliate: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
  }),
  items: z.array(adminAffiliateReferralRowSchema),
  total: z.number(),
});

export const adminUserRowSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  whatsappNumber: z.string(),
  city: z.string().nullable(),
  affiliateId: z.string().nullable(),
  affiliateName: z.string().nullable(),
  affiliateCode: z.string().nullable(),
  status: z.enum(["TRIAL", "ACTIVE", "PAUSED", "CANCELED"]),
  trialEndsAt: z.string().nullable(),
  subscribedAt: z.string().nullable(),
  createdAt: z.string(),
  deliveryCount: z.number(),
  lastPaymentStatus: z
    .enum(["PENDING", "PAID", "FAILED", "REFUNDED"])
    .nullable(),
  isDelinquent: z.boolean(),
  delinquencyReason: z
    .enum(["trial_expired", "payment_pending", "payment_failed"])
    .nullable(),
  daysOverdue: z.number().nullable(),
  usageDays: z.number(),
  usageMonths: z.number(),
  usageRemainderDays: z.number(),
});

export const adminCreateUserSchema = z.object({
  whatsappNumber: z.string().min(10).max(20),
  name: z.string().trim().min(1).max(80).optional(),
  city: z.string().trim().max(80).nullable().optional(),
  status: z.enum(["TRIAL", "ACTIVE", "PAUSED", "CANCELED"]).optional(),
  affiliateCode: affiliateCodeFieldSchema.optional(),
});

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;

export const adminPaymentLinkResponseSchema = z.object({
  paymentId: z.string(),
  invoiceUrl: z.string(),
  pixCopyPaste: z.string().nullable(),
  amount: z.number(),
  whatsappText: z.string(),
  whatsappUrl: z.string(),
});

export type AdminPaymentLinkResponse = z.infer<
  typeof adminPaymentLinkResponseSchema
>;

export const adminUsersListSchema = z.object({
  items: z.array(adminUserRowSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const adminDelinquentListSchema = adminUsersListSchema;

export const adminUsageLogRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userPhone: z.string(),
  userCity: z.string().nullable(),
  category: z.string(),
  action: z.string(),
  title: z.string(),
  source: z.enum(["app", "whatsapp"]),
  changesSummary: z.string().nullable(),
  createdAt: z.string(),
});

export const adminUsageLogsSchema = z.object({
  items: z.array(adminUsageLogRowSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type AffiliateValidateResponse = z.infer<
  typeof affiliateValidateResponseSchema
>;
export type AdminOverview = z.infer<typeof adminOverviewSchema>;
export type AdminUsersList = z.infer<typeof adminUsersListSchema>;
export type AdminUserRow = z.infer<typeof adminUserRowSchema>;
export type AdminAffiliateRow = z.infer<typeof adminAffiliateRowSchema>;
export type AdminAffiliatesList = z.infer<typeof adminAffiliatesListSchema>;
export type AdminCreateAffiliateInput = z.infer<typeof adminCreateAffiliateSchema>;
export type AdminAffiliateReferrals = z.infer<
  typeof adminAffiliateReferralsSchema
>;
export type AdminDelinquentList = z.infer<typeof adminDelinquentListSchema>;
export type AdminUsageLogs = z.infer<typeof adminUsageLogsSchema>;
export type AdminUsageLogRow = z.infer<typeof adminUsageLogRowSchema>;
