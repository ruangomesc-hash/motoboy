import type { PeriodStats, TodaySummary } from "@motoboy/types";
import type { MeSettingsSnapshot } from "@/lib/me-settings";

export type DeliveryListItem = {
  id: string;
  grossValue: string | number;
  originName: string | null;
  source: string;
  occurredAt: string;
  distanceKm?: string | number | null;
};

const CACHE_PREFIX = "motocopiloto_app_cache_v1";

export type PersistedAppCache = {
  today: TodaySummary | null;
  meSettings: MeSettingsSnapshot | null;
  deliveries: DeliveryListItem[];
  deliveriesDate: string;
  statsWeek: PeriodStats | null;
  profileName: string | null;
  configComplete: boolean | null;
  savedAt: number;
};

export function appCacheStorageKey(userId: string): string {
  return `${CACHE_PREFIX}:${userId}`;
}

export function readAppCache(userId: string): PersistedAppCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(appCacheStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAppCache;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAppCache(
  userId: string,
  data: Omit<PersistedAppCache, "savedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedAppCache = {
      ...data,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(
      appCacheStorageKey(userId),
      JSON.stringify(payload),
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearAppCache(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(appCacheStorageKey(userId));
  } catch {
    /* ignore */
  }
}

export function isCacheStale(savedAt: number, maxAgeMs = 30_000): boolean {
  return Date.now() - savedAt > maxAgeMs;
}
