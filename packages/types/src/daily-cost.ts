import { z } from "zod";

export const dailyCostKeySchema = z.enum(["fuel", "maintenance", "other"]);

export type DailyCostKey = z.infer<typeof dailyCostKeySchema>;

export const DAILY_COST_KEYS: DailyCostKey[] = [
  "fuel",
  "maintenance",
  "other",
];

export function isDailyCostKey(value: string): value is DailyCostKey {
  return dailyCostKeySchema.safeParse(value).success;
}

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dailyCostExclusionBodySchema = z.object({
  dateKey: dateKeySchema,
  costKey: dailyCostKeySchema,
});

export type DailyCostExclusionBody = z.infer<typeof dailyCostExclusionBodySchema>;

export type DailyCostExclusionItem = DailyCostExclusionBody;

export function dailyCostExclusionId(
  dateKey: string,
  costKey: DailyCostKey,
): string {
  return `${dateKey}:${costKey}`;
}
