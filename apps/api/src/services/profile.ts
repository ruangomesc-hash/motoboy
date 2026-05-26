import { prisma } from "@motoboy/db";
import {
  deliverySourceSchema,
  subscriptionPaymentMethodSchema,
  type ProfileUpdateInput,
  type SubscriptionPaymentMethod,
} from "@motoboy/types";
import { z } from "zod";
import { parseWorkDays } from "../lib/work-calendar.js";
import {
  diffValues,
  profileDiffFields,
  recordActivity,
} from "./activity-log.js";

export function parseWorkApps(value: unknown): z.infer<typeof deliverySourceSchema>[] {
  const parsed = z.array(deliverySourceSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseSubscriptionPaymentMethod(
  value: unknown,
): SubscriptionPaymentMethod {
  const parsed = subscriptionPaymentMethodSchema.safeParse(value);
  return parsed.success ? parsed.data : "PIX";
}

export function toUserProfile(user: {
  id: string;
  name: string | null;
  email: string | null;
  city: string | null;
  vehiclePlate: string | null;
  whatsappNumber: string;
  workApps: unknown;
  subscriptionPaymentMethod: string;
  workDays?: unknown;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    city: user.city,
    vehiclePlate: user.vehiclePlate,
    whatsappNumber: user.whatsappNumber,
    workApps: parseWorkApps(user.workApps),
    subscriptionPaymentMethod: parseSubscriptionPaymentMethod(
      user.subscriptionPaymentMethod,
    ),
    workDays: parseWorkDays(user.workDays),
  };
}

export async function updateUserProfile(
  userId: string,
  input: ProfileUpdateInput,
) {
  const before = await prisma.user.findUnique({ where: { id: userId } });
  const beforeProfile = before ? toUserProfile(before) : null;

  const data: {
    name?: string;
    email?: string;
    city?: string | null;
    vehiclePlate?: string | null;
    workApps?: string[];
    subscriptionPaymentMethod?: string;
    workDays?: number[];
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
  if (input.city !== undefined) data.city = input.city;
  if (input.vehiclePlate !== undefined) data.vehiclePlate = input.vehiclePlate;
  if (input.workApps !== undefined) data.workApps = input.workApps;
  if (input.subscriptionPaymentMethod !== undefined) {
    data.subscriptionPaymentMethod = input.subscriptionPaymentMethod;
  }
  if (input.workDays !== undefined) data.workDays = input.workDays;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const profile = toUserProfile(user);
  const changes = diffValues(
    (
      Object.keys(profileDiffFields) as (keyof typeof profileDiffFields)[]
    )
      .filter((key) => input[key as keyof ProfileUpdateInput] !== undefined)
      .map((key) => ({
        field: key,
        label: profileDiffFields[key].label,
        before: beforeProfile?.[key as keyof typeof beforeProfile],
        after: profile[key as keyof typeof profile],
        format: profileDiffFields[key].format,
      })),
  );

  if (changes.length > 0) {
    await recordActivity(userId, {
      category: "PROFILE",
      action: "UPDATED",
      title: "Perfil atualizado",
      changes,
    });
  }

  return profile;
}
