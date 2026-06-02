"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useSession } from "next-auth/react";
import { resolvePeriodRange, type PeriodStats, type TodaySummary } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import {
  buildAppSyncKey,
  type AppSyncDetail,
  type AppSyncTopic,
  notifyAppSync,
  registerAppSyncPersist,
  shouldHandleSync,
  subscribeAppSync,
} from "@/lib/app-sync";
import type { CreatedDelivery } from "@/lib/app-data-cache";
import { emptyTodaySummary } from "@/lib/empty-today-summary";
import {
  isIsoOnDateInput,
  resolveDeliveriesFilterDate,
  todayDateInputValue,
} from "@/lib/local-date";
import {
  isServerConfigComplete,
  markConfigSavedOnce,
  clearConfigSavedOnce,
} from "@/lib/onboarding";
import {
  type ConfigSavePayload,
  type MeApiResponse,
  type MeSettingsSnapshot,
  buildMeSnapshotAfterSave,
  buildOptimisticMeFromPending,
  parseMeSettings,
  readPendingRegistrationProfile,
  toCostsPutBody,
  toGoalsPutBody,
  toProfilePutBody,
} from "@/lib/me-settings";
import type { GoalsPlan, UserProfile } from "@motoboy/types";
import { parseBrazilWhatsAppDigits, toStoredWhatsApp } from "@motoboy/types";
import {
  appCacheStorageKey,
  clearAppCache,
  isCacheStale,
  readAppCache,
  writeAppCache,
  type DeliveryListItem,
  type PersistedAppCache,
} from "@/lib/app-persist-cache";
import { DEMO_USER_ID } from "@/lib/demo-data";
import { normalizePeriodStats } from "@/lib/stats-preview";
import { mergeLivePeriodStats } from "@/lib/period-stats-compute";
import { createDeletedDeliveryRegistry } from "@/lib/deleted-delivery-tombstones";
import { createPendingDeliveryRegistry } from "@/lib/pending-delivery-registry";
import { clearInflightCreates } from "@/lib/inflight-delivery-create";
import {
  dedupeRecentDeliveries,
  mergeDeliveryLists,
  mergeDeliveryListsFromServerPoll,
  mergeTodayFromServer,
  selectDeliveriesForDate,
  upsertDeliveriesForDate,
} from "@/lib/merge-app-data";
import { recomputeTodayFromDeliveries } from "@/lib/today-recent-from-deliveries";

export type { DeliveryListItem };

type AppDataContextValue = {
  today: TodaySummary | null;
  profileName: string | null;
  deliveries: DeliveryListItem[];
  /** Hoje (device) — lista do dia + período; Home sempre usa isto. */
  todayDeliveries: DeliveryListItem[];
  deliveriesDate: string;
  setDeliveriesDate: (date: string) => void;
  /** Alinha o filtro de Entregas ao dia atual do celular (após meia-noite). */
  syncDeliveriesFilterDate: () => void;
  statsWeek: PeriodStats | null;
  statsMonth: PeriodStats | null;
  /** Entregas do mês da data âncora — base ao vivo das estatísticas. */
  periodDeliveries: DeliveryListItem[];
  liveStatsWeek: PeriodStats | null;
  liveStatsMonth: PeriodStats | null;
  isBootstrapped: boolean;
  configComplete: boolean | null;
  meSettings: MeSettingsSnapshot | null;
  meSettingsLoading: boolean;
  loadMeSettings: (opts?: {
    force?: boolean;
    silent?: boolean;
  }) => Promise<MeSettingsSnapshot | null>;
  saveMeSettings: (
    payload: ConfigSavePayload,
  ) => Promise<{ complete: boolean; me: MeSettingsSnapshot | null }>;
  refreshToday: () => Promise<void>;
  refreshDeliveries: () => Promise<void>;
  refreshStats: (period: "week" | "month") => Promise<void>;
  refreshConfigStatus: () => Promise<boolean>;
  applyDeliveryOptimistic: (delivery: CreatedDelivery) => void;
  upsertDeliveryOptimistic: (
    delivery: CreatedDelivery,
    previous?: CreatedDelivery,
  ) => void;
  removeDeliveryOptimistic: (id: string, fallback?: CreatedDelivery) => void;
  patchDeliveryInList: (item: DeliveryListItem) => void;
  /** Persiste cache + notifica outras abas na hora */
  publishAppSync: (
    topics: AppSyncTopic | AppSyncTopic[],
    extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
  ) => void;
  /** Alinha Home, Entregas e Stats com o servidor (debounced). */
  scheduleDeliveryReconcile: () => void;
  markDeliveryCancelled: (localId: string) => void;
  isDeliveryCancelled: (localId: string) => boolean;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
/** Atualização do app sem socket — poll com aba visível. */
const POLL_MS = 500;
/** Reconciliação após edição local no app (debounce curto). */
const MUTATION_SETTLE_MS = 400;
/** Após entrega via Zap/socket: busca servidor em ~100ms. */
const SYNC_RECONCILE_MS = 100;
const STATS_REFRESH_MS = 400;
const OWN_SYNC_KEY_TTL_MS = 1_500;

function upsertDeliveryItem(
  list: DeliveryListItem[],
  item: DeliveryListItem,
  removeId?: string,
): DeliveryListItem[] {
  let next = removeId ? list.filter((d) => d.id !== removeId) : list;
  const idx = next.findIndex((d) => d.id === item.id);
  if (idx >= 0) {
    const copy = [...next];
    copy[idx] = item;
    return copy;
  }
  return [item, ...next];
}

function topicsMatch(subscribed: AppSyncTopic[], incoming: AppSyncTopic[]): boolean {
  return shouldHandleSync(subscribed, incoming);
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const { status, data: session } = useSession();
  const token = session?.accessToken;
  const userId =
    session?.userId ?? (session?.demo ? DEMO_USER_ID : undefined);

  const [today, setToday] = useState<TodaySummary | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [deliveriesDate, setDeliveriesDate] = useState(todayDateInputValue);
  const [statsWeek, setStatsWeek] = useState<PeriodStats | null>(null);
  const [statsMonth, setStatsMonth] = useState<PeriodStats | null>(null);
  const [periodDeliveries, setPeriodDeliveries] = useState<DeliveryListItem[]>(
    [],
  );
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [configComplete, setConfigComplete] = useState<boolean | null>(null);
  const [meSettings, setMeSettings] = useState<MeSettingsSnapshot | null>(null);
  const [meSettingsLoading, setMeSettingsLoading] = useState(false);

  const meSettingsRef = useRef<MeSettingsSnapshot | null>(null);
  const bootstrapStarted = useRef(false);
  const configRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meLoadSeq = useRef(0);
  const deliveriesFetchSeq = useRef(0);
  const periodFetchSeq = useRef(0);
  const deliveryMutationGen = useRef(0);
  const ownSyncKeys = useRef(new Set<string>());
  const mutationSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const syncReconcileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconcileInFlight = useRef(false);
  const statsRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedUser = useRef<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deletedDeliveries = useRef(createDeletedDeliveryRegistry());
  const pendingDeliveries = useRef(createPendingDeliveryRegistry());

  const stateRef = useRef({
    today,
    profileName,
    deliveries,
    deliveriesDate,
    periodDeliveries,
    statsWeek,
    statsMonth,
    configComplete,
    meSettings,
  });
  stateRef.current = {
    today,
    profileName,
    deliveries,
    deliveriesDate,
    periodDeliveries,
    statsWeek,
    statsMonth,
    configComplete,
    meSettings,
  };

  const persistCacheNow = useCallback((uid: string) => {
    const s = stateRef.current;
    writeAppCache(uid, {
      today: s.today,
      meSettings: s.meSettings,
      deliveries: deletedDeliveries.current.filter(s.deliveries),
      periodDeliveries: deletedDeliveries.current.filter(s.periodDeliveries),
      deliveriesDate: s.deliveriesDate,
      statsWeek: s.statsWeek,
      statsMonth: s.statsMonth,
      profileName: s.profileName,
      configComplete: s.configComplete,
      deletedDeliveryIds: deletedDeliveries.current.toArray(),
    });
  }, []);

  const persistNow = persistCacheNow;

  const scheduleStatsRefresh = useCallback(() => {
    if (statsRefreshTimer.current) clearTimeout(statsRefreshTimer.current);
    statsRefreshTimer.current = setTimeout(() => {
      statsRefreshTimer.current = null;
      void refreshStatsRef.current?.("week");
      void refreshStatsRef.current?.("month");
    }, STATS_REFRESH_MS);
  }, []);

  const bumpDeliveryMutation = useCallback(() => {
    deliveryMutationGen.current += 1;
    if (mutationSettleTimer.current) {
      clearTimeout(mutationSettleTimer.current);
    }
    mutationSettleTimer.current = setTimeout(() => {
      mutationSettleTimer.current = null;
      const gen = deliveryMutationGen.current;
      void (async () => {
        await Promise.all([
          refreshTodayRef.current?.(gen),
          refreshDeliveriesRef.current?.(gen),
          refreshPeriodDeliveriesRef.current?.(gen),
          refreshStatsRef.current?.("week"),
          refreshStatsRef.current?.("month"),
        ]);
      })();
    }, MUTATION_SETTLE_MS);
  }, []);

  const refreshTodayRef = useRef<
    ((mutationGenAtStart?: number) => Promise<void>) | null
  >(null);
  const refreshDeliveriesRef = useRef<
    ((mutationGenAtStart?: number) => Promise<void>) | null
  >(null);
  const refreshStatsRef = useRef<
    ((period: "week" | "month") => Promise<void>) | null
  >(null);
  const refreshPeriodDeliveriesRef = useRef<
    ((mutationGenAtStart?: number) => Promise<void>) | null
  >(null);

  const schedulePersist = useCallback(
    (uid: string) => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        persistTimer.current = null;
        persistNow(uid);
      }, 50);
    },
    [persistNow],
  );

  const syncDeliveriesFilterDate = useCallback(() => {
    const resolved = resolveDeliveriesFilterDate(
      stateRef.current.deliveriesDate,
    );
    if (resolved === stateRef.current.deliveriesDate) return;
    setDeliveriesDate(resolved);
  }, []);

  const applyCacheSnapshot = useCallback((cached: PersistedAppCache) => {
    if (cached.deletedDeliveryIds?.length) {
      deletedDeliveries.current.hydrate(cached.deletedDeliveryIds);
    }
    if (cached.today) {
      setToday(deletedDeliveries.current.applyToTodaySummary(cached.today));
    }
    if (cached.meSettings) {
      setMeSettings(cached.meSettings);
      meSettingsRef.current = cached.meSettings;
      setConfigComplete(
        cached.configComplete ?? isServerConfigComplete(cached.meSettings),
      );
    }
    setDeliveries(deletedDeliveries.current.filter(cached.deliveries));
    setPeriodDeliveries(
      deletedDeliveries.current.filter(cached.periodDeliveries ?? []),
    );
    setDeliveriesDate(resolveDeliveriesFilterDate(cached.deliveriesDate));
    if (cached.statsWeek) {
      setStatsWeek(
        normalizePeriodStats(
          cached.statsWeek,
          "week",
          cached.deliveriesDate || todayDateInputValue(),
        ),
      );
    }
    if (cached.statsMonth) {
      setStatsMonth(
        normalizePeriodStats(
          cached.statsMonth,
          "month",
          cached.deliveriesDate || todayDateInputValue(),
        ),
      );
    }
    if (cached.profileName) setProfileName(cached.profileName);
    setIsBootstrapped(true);
  }, []);

  const applyMeSnapshot = useCallback((snap: MeSettingsSnapshot) => {
    setMeSettings(snap);
    meSettingsRef.current = snap;
    const complete = isServerConfigComplete(snap);
    setConfigComplete(complete);
    setProfileName(snap.profile?.name ?? null);
    setIsBootstrapped(true);
    return complete;
  }, []);

  const refreshToday = useCallback(
    async (
      mutationGenAtStart?: number,
      options?: { background?: boolean },
    ) => {
      const genAtStart = mutationGenAtStart ?? deliveryMutationGen.current;
      try {
        const data = await api<TodaySummary>("/me/today");
        if (
          !options?.background &&
          genAtStart !== deliveryMutationGen.current
        ) {
          return;
        }

        const tomb = deletedDeliveries.current;
        const todayKey = todayDateInputValue();
        const tombSet = new Set(tomb.toArray());

        setToday((prev) => {
          const fromServer = tomb.applyToTodaySummary(data);
          const merged = mergeTodayFromServer(
            fromServer,
            options?.background ? null : prev,
            tombSet,
            todayKey,
          );

          if (options?.background) {
            return {
              ...merged,
              recentDeliveries: dedupeRecentDeliveries(
                merged.recentDeliveries,
              ).slice(0, 3),
            };
          }

          const recentFromList = mergeDeliveryLists(
            [],
            stateRef.current.deliveries,
            todayKey,
            tombSet,
          )
            .slice(0, 3)
            .map((d) => ({
              id: d.id,
              grossValue: Number(d.grossValue),
              originName: d.originName,
              source: d.source as TodaySummary["recentDeliveries"][0]["source"],
              occurredAt: d.occurredAt,
            }));

          return {
            ...merged,
            recentDeliveries:
              recentFromList.length > 0
                ? recentFromList
                : dedupeRecentDeliveries(merged.recentDeliveries).slice(0, 3),
          };
        });

        if (genAtStart === deliveryMutationGen.current) {
          tomb.pruneConfirmedAbsent(data.recentDeliveries.map((d) => d.id));
        }
        if (userId) schedulePersist(userId);
      } catch {
        /* mantém cache */
      }
    },
    [api, schedulePersist, userId],
  );
  refreshTodayRef.current = refreshToday;

  const upsertDeliveryOptimistic = useCallback(
    (delivery: CreatedDelivery, previous?: CreatedDelivery) => {
      deletedDeliveries.current.unmark(delivery.id);
      const occurredAt = delivery.occurredAt ?? new Date().toISOString();
      const todayKey = todayDateInputValue();
      const item: DeliveryListItem = {
        id: delivery.id,
        grossValue: delivery.grossValue,
        originName: delivery.originName ?? null,
        source: delivery.source,
        occurredAt,
        distanceKm: delivery.distanceKm ?? null,
      };

      const prevPayload =
        previous ??
        (() => {
          const row = stateRef.current.deliveries.find((d) => d.id === item.id);
          if (row) {
            return {
              id: row.id,
              grossValue: row.grossValue,
              source: row.source,
              originName: row.originName,
              occurredAt: row.occurredAt,
              distanceKm: row.distanceKm ?? null,
            };
          }
          const recent = stateRef.current.today?.recentDeliveries.find(
            (r) => r.id === item.id,
          );
          if (!recent) return undefined;
          return {
            id: recent.id,
            grossValue: recent.grossValue,
            source: recent.source,
            originName: recent.originName,
            occurredAt: recent.occurredAt,
            distanceKm: null,
          };
        })();

      if (item.id.startsWith("local-")) {
        pendingDeliveries.current.mark(item.id);
      } else if (prevPayload?.id.startsWith("local-")) {
        pendingDeliveries.current.unmark(prevPayload.id);
      }

      const removeId =
        prevPayload && prevPayload.id !== item.id ? prevPayload.id : undefined;

      flushSync(() => {
        const nextDeliveries = upsertDeliveryItem(
          stateRef.current.deliveries,
          item,
          removeId,
        );
        const nextPeriodDeliveries = upsertDeliveryItem(
          stateRef.current.periodDeliveries,
          item,
          removeId,
        );

        const todayBase = stateRef.current.today ?? emptyTodaySummary();
        const nextToday = recomputeTodayFromDeliveries(
          nextDeliveries,
          todayBase,
          todayKey,
          new Set(deletedDeliveries.current.toArray()),
        );

        const nextDate = isIsoOnDateInput(occurredAt, todayKey)
          ? todayKey
          : stateRef.current.deliveriesDate || todayKey;

        stateRef.current = {
          ...stateRef.current,
          deliveries: nextDeliveries,
          periodDeliveries: nextPeriodDeliveries,
          today: nextToday,
          deliveriesDate: nextDate,
        };
        setDeliveries(nextDeliveries);
        setPeriodDeliveries(nextPeriodDeliveries);
        setDeliveriesDate(nextDate);
        setToday(nextToday);
      });

      if (userId) persistCacheNow(userId);
      scheduleStatsRefresh();
      bumpDeliveryMutation();
    },
    [userId, persistCacheNow, scheduleStatsRefresh, bumpDeliveryMutation],
  );

  const applyDeliveryOptimistic = useCallback(
    (delivery: CreatedDelivery) => {
      upsertDeliveryOptimistic(delivery);
    },
    [upsertDeliveryOptimistic],
  );

  const removeDeliveryOptimistic = useCallback(
    (deliveryId: string, fallback?: CreatedDelivery) => {
      deletedDeliveries.current.mark(deliveryId);
      pendingDeliveries.current.unmark(deliveryId);
      const s = stateRef.current;
      const todayKey = todayDateInputValue();

      const nextDeliveries = s.deliveries.filter((d) => d.id !== deliveryId);
      const nextPeriodDeliveries = s.periodDeliveries.filter(
        (d) => d.id !== deliveryId,
      );
      const base = s.today ?? emptyTodaySummary();
      const nextToday = recomputeTodayFromDeliveries(
        nextDeliveries,
        base,
        todayKey,
        new Set(deletedDeliveries.current.toArray()),
      );

      flushSync(() => {
        stateRef.current = {
          ...s,
          deliveries: nextDeliveries,
          periodDeliveries: nextPeriodDeliveries,
          today: nextToday,
        };
        setDeliveries(nextDeliveries);
        setPeriodDeliveries(nextPeriodDeliveries);
        setToday(nextToday);
      });

      if (userId) persistCacheNow(userId);
      scheduleStatsRefresh();
      bumpDeliveryMutation();
    },
    [userId, persistCacheNow, scheduleStatsRefresh, bumpDeliveryMutation],
  );

  const patchDeliveryInList = useCallback(
    (item: DeliveryListItem) => {
      setDeliveries((prev) => {
        const idx = prev.findIndex((d) => d.id === item.id);
        if (idx < 0) return [item, ...prev];
        const next = [...prev];
        next[idx] = item;
        return next;
      });
      if (userId) persistNow(userId);
    },
    [userId, persistNow],
  );

  const refreshDeliveries = useCallback(
    async (
      mutationGenAtStart?: number,
      options?: { background?: boolean },
    ) => {
      const genAtStart = mutationGenAtStart ?? deliveryMutationGen.current;
      const date = deliveriesDate || todayDateInputValue();
      const seq = ++deliveriesFetchSeq.current;
      const q = `?date=${date}&limit=100`;
      try {
        const r = await api<{ items: DeliveryListItem[] }>(`/me/deliveries${q}`);
        if (seq !== deliveriesFetchSeq.current) return;
        if (
          !options?.background &&
          genAtStart !== deliveryMutationGen.current
        ) {
          return;
        }

        const tomb = deletedDeliveries.current;
        const tombSet = new Set(tomb.toArray());
        const items = tomb.filter(r.items);
        const todayKey = todayDateInputValue();

        setDeliveries((prev) =>
          options?.background
            ? upsertDeliveriesForDate(prev, items, date, tombSet, {
                serverPoll: true,
              })
            : upsertDeliveriesForDate(prev, items, date, tombSet),
        );

        if (options?.background && date !== todayKey) {
          const todayRes = await api<{ items: DeliveryListItem[] }>(
            `/me/deliveries?date=${todayKey}&limit=100`,
          );
          if (seq !== deliveriesFetchSeq.current) return;
          const todayItems = tomb.filter(todayRes.items);
          setDeliveries((prev) =>
            upsertDeliveriesForDate(prev, todayItems, todayKey, tombSet, {
              serverPoll: true,
            }),
          );
          tomb.pruneConfirmedAbsent(todayRes.items.map((d) => d.id));
        } else if (genAtStart === deliveryMutationGen.current) {
          tomb.pruneConfirmedAbsent(r.items.map((d) => d.id));
        }
        if (userId) schedulePersist(userId);
      } catch {
        /* mantém cache */
      }
    },
    [api, deliveriesDate, schedulePersist, userId],
  );
  refreshDeliveriesRef.current = refreshDeliveries;

  const refreshPeriodDeliveries = useCallback(
    async (
      mutationGenAtStart?: number,
      options?: { background?: boolean },
    ) => {
      const genAtStart = mutationGenAtStart ?? deliveryMutationGen.current;
      const anchorDate =
        stateRef.current.deliveriesDate || todayDateInputValue();
      const range = resolvePeriodRange("month", anchorDate);
      const seq = ++periodFetchSeq.current;
      try {
        const r = await api<{ items: DeliveryListItem[] }>(
          `/me/deliveries?from=${range.periodStart}&to=${range.periodEnd}&limit=500`,
        );
        if (seq !== periodFetchSeq.current) return;
        if (
          !options?.background &&
          genAtStart !== deliveryMutationGen.current
        ) {
          return;
        }

        const tomb = deletedDeliveries.current;
        const tombSet = new Set(tomb.toArray());
        const items = tomb.filter(r.items);
        setPeriodDeliveries((prev) => {
          const serverIds = new Set(items.map((d) => d.id));
          const pendingLocal = prev.filter(
            (d) =>
              d.id.startsWith("local-") &&
              !tombSet.has(d.id) &&
              !serverIds.has(d.id),
          );
          return [...pendingLocal, ...items];
        });

        if (genAtStart === deliveryMutationGen.current) {
          tomb.pruneConfirmedAbsent(r.items.map((d) => d.id));
        }
        if (userId) schedulePersist(userId);
      } catch {
        /* mantém cache */
      }
    },
    [api, schedulePersist, userId],
  );
  refreshPeriodDeliveriesRef.current = refreshPeriodDeliveries;

  const refreshStats = useCallback(
    async (period: "week" | "month") => {
      const genAtStart = deliveryMutationGen.current;
      const date =
        stateRef.current.deliveriesDate || todayDateInputValue();
      try {
        const data = normalizePeriodStats(
          await api<PeriodStats>(
            `/me/stats?period=${period}&date=${encodeURIComponent(date)}`,
          ),
          period,
          date,
        );
        if (!data || genAtStart !== deliveryMutationGen.current) return;
        if (period === "week") {
          setStatsWeek(data);
        } else {
          setStatsMonth(data);
        }
        if (userId) schedulePersist(userId);
      } catch {
        /* mantém cache */
      }
    },
    [api, deliveriesDate, schedulePersist, userId],
  );
  refreshStatsRef.current = refreshStats;

  const loadMeSettings = useCallback(
    async (opts?: { force?: boolean; silent?: boolean }) => {
      if (status !== "authenticated") return null;
      if (!token && !session?.demo) return meSettingsRef.current;

      const pending = readPendingRegistrationProfile();
      if (pending && !meSettingsRef.current) {
        applyMeSnapshot(buildOptimisticMeFromPending(pending));
      }

      const cached = meSettingsRef.current;
      if (!opts?.force && cached) {
        if (!opts?.silent) {
          const seq = ++meLoadSeq.current;
          void api<MeApiResponse>("/me")
            .then((data) => {
              if (seq !== meLoadSeq.current) return;
              applyMeSnapshot(parseMeSettings(data));
              if (userId) schedulePersist(userId);
            })
            .catch(() => {});
        }
        return cached;
      }

      const seq = ++meLoadSeq.current;
      if (!opts?.silent && !cached && !pending) setMeSettingsLoading(true);
      try {
        const data = await api<MeApiResponse>("/me");
        if (seq !== meLoadSeq.current) return null;
        const snap = parseMeSettings(data);
        if (pending) {
          applyMeSnapshot({
            ...snap,
            profile: {
              ...snap.profile,
              name: snap.profile.name?.trim() || pending.name,
              email: snap.profile.email?.trim() || pending.email,
            },
          });
        } else {
          applyMeSnapshot(snap);
        }
        if (userId) schedulePersist(userId);
        return snap;
      } catch {
        if (seq === meLoadSeq.current && !cached) {
          setConfigComplete(false);
          if (pending) setIsBootstrapped(true);
        }
        return cached;
      } finally {
        if (seq === meLoadSeq.current) setMeSettingsLoading(false);
      }
    },
    [
      api,
      applyMeSnapshot,
      schedulePersist,
      session?.demo,
      status,
      token,
      userId,
    ],
  );

  const refreshConfigStatus = useCallback(async () => {
    const snap = await loadMeSettings({ force: true });
    return snap ? isServerConfigComplete(snap) : false;
  }, [loadMeSettings]);

  const queueConfigRefresh = useCallback(() => {
    if (configRefreshTimer.current) clearTimeout(configRefreshTimer.current);
    configRefreshTimer.current = setTimeout(() => {
      configRefreshTimer.current = null;
      void loadMeSettings({ force: true, silent: true });
    }, 80);
  }, [loadMeSettings]);

  const markDeliveryCancelled = useCallback((localId: string) => {
    pendingDeliveries.current.markCancelled(localId);
  }, []);

  const isDeliveryCancelled = useCallback((localId: string) => {
    return pendingDeliveries.current.isCancelled(localId);
  }, []);

  const scheduleDeliveryReconcile = useCallback(() => {
    bumpDeliveryMutation();
  }, [bumpDeliveryMutation]);

  const reconcileDeliveriesIfIdle = useCallback(async () => {
    if (reconcileInFlight.current) return;
    reconcileInFlight.current = true;
    const background = { background: true as const };
    try {
      await refreshDeliveries(undefined, background);
      await refreshPeriodDeliveries(undefined, background);
      await refreshToday(undefined, background);
    } finally {
      reconcileInFlight.current = false;
    }
  }, [refreshDeliveries, refreshPeriodDeliveries, refreshToday]);

  const scheduleSyncReconcile = useCallback(() => {
    if (syncReconcileTimer.current) clearTimeout(syncReconcileTimer.current);
    syncReconcileTimer.current = setTimeout(() => {
      syncReconcileTimer.current = null;
      reconcileDeliveriesIfIdle();
    }, SYNC_RECONCILE_MS);
  }, [reconcileDeliveriesIfIdle]);

  const publishAppSync = useCallback(
    (
      topics: AppSyncTopic | AppSyncTopic[],
      extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
    ) => {
      const list = Array.isArray(topics) ? topics : [topics];
      const syncKey = buildAppSyncKey(list, extra);
      ownSyncKeys.current.add(syncKey);
      window.setTimeout(() => {
        ownSyncKeys.current.delete(syncKey);
      }, OWN_SYNC_KEY_TTL_MS);

      if (userId) persistCacheNow(userId);
      notifyAppSync(topics, {
        ...extra,
        deletedDeliveryIds: deletedDeliveries.current.toArray(),
      });
    },
    [userId, persistCacheNow],
  );

  const applySyncDetail = useCallback(
    (detail: AppSyncDetail | undefined) => {
      if (!detail) return;
      const incoming = detail.topics ?? ["all"];

      if (detail.deletedDeliveryIds?.length) {
        deletedDeliveries.current.hydrate(detail.deletedDeliveryIds);
      }

      const isOwnEvent =
        detail.syncKey != null && ownSyncKeys.current.has(detail.syncKey);

      if (!isOwnEvent) {
        if (detail.removedDeliveryId) {
          removeDeliveryOptimistic(
            detail.removedDeliveryId,
            detail.removedDelivery,
          );
        } else if (detail.delivery) {
          upsertDeliveryOptimistic(detail.delivery, detail.previousDelivery);
        }
      }

      if (userId) persistCacheNow(userId);

      if (detail.skipReconcile) {
        return;
      }

      if (topicsMatch(["today", "deliveries", "stats", "all"], incoming)) {
        if (detail.delivery || detail.removedDeliveryId) {
          scheduleSyncReconcile();
        } else {
          scheduleDeliveryReconcile();
        }
      }
      if (topicsMatch(["profile", "all"], incoming)) {
        queueConfigRefresh();
      }
    },
    [
      persistCacheNow,
      queueConfigRefresh,
      removeDeliveryOptimistic,
      scheduleDeliveryReconcile,
      scheduleSyncReconcile,
      upsertDeliveryOptimistic,
      userId,
    ],
  );

  const saveMeSettings = useCallback(
    async (payload: ConfigSavePayload) => {
      const loginPhone = session?.phone ?? null;
      const current = meSettingsRef.current;
      if (current) {
        const optimistic: MeSettingsSnapshot = {
          profile: {
            ...current.profile,
            ...toProfilePutBody(payload.profile, loginPhone),
            whatsappNumber:
              payload.profile.whatsappPhone.replace(/\D/g, "").length === 11
                ? toStoredWhatsApp(payload.profile.whatsappPhone)
                : loginPhone
                  ? toStoredWhatsApp(loginPhone)
                  : current.profile.whatsappNumber,
            workApps: payload.profile.workApps,
            workDays: payload.profile.workDays,
            subscriptionPaymentMethod:
              payload.profile.subscriptionPaymentMethod,
          },
          goalsPlan: current.goalsPlan
            ? {
                ...current.goalsPlan,
                monthlyTarget: Number(payload.monthlyGoal),
                workDays: payload.profile.workDays,
              }
            : null,
          costs: current.costs,
        };
        applyMeSnapshot(optimistic);
        if (userId) persistNow(userId);
      }

      const requests = [
        api(
          "/me/profile",
          {
            method: "PUT",
            body: JSON.stringify(toProfilePutBody(payload.profile, loginPhone)),
          },
          { skipSync: true },
        ),
        api(
          "/me/goals/plan",
          {
            method: "PUT",
            body: JSON.stringify(toGoalsPutBody(payload)),
          },
          { skipSync: true },
        ),
      ];

      const saveCosts = payload.saveCosts !== false;
      if (saveCosts) {
        requests.push(
          api(
            "/me/costs",
            {
              method: "PUT",
              body: JSON.stringify(toCostsPutBody(payload)),
            },
            { skipSync: true },
          ),
        );
      }

      const [profileRes, planRes] = (await Promise.all(requests)) as [
        UserProfile,
        { plan: GoalsPlan },
      ];

      const snap = buildMeSnapshotAfterSave(
        payload,
        profileRes,
        planRes.plan,
        saveCosts ? undefined : current?.costs ?? null,
      );
      applyMeSnapshot(snap);
      if (userId) persistNow(userId);
      markConfigSavedOnce();
      publishAppSync(["profile", "today", "stats"], { skipReconcile: true });

      return {
        complete: isServerConfigComplete(snap),
        me: snap,
      };
    },
    [api, applyMeSnapshot, persistNow, publishAppSync, session?.phone, userId],
  );

  const bootstrap = useCallback(() => {
    const pending = readPendingRegistrationProfile();
    if (pending && !meSettingsRef.current) {
      applyMeSnapshot(buildOptimisticMeFromPending(pending));
    }

    const cached = userId ? readAppCache(userId) : null;
    const stale = !cached || isCacheStale(cached.savedAt, POLL_MS);

    void loadMeSettings({
      force: stale || Boolean(pending),
      silent: Boolean(cached || pending),
    });

    requestAnimationFrame(() => {
      void refreshToday();
      void refreshDeliveries();
      void refreshPeriodDeliveries();
      void refreshStats("week");
      void refreshStats("month");
    });
  }, [
    applyMeSnapshot,
    loadMeSettings,
    refreshDeliveries,
    refreshPeriodDeliveries,
    refreshStats,
    refreshToday,
    userId,
  ]);

  useLayoutEffect(() => {
    if (!userId) return;
    if (hydratedUser.current === userId) return;
    hydratedUser.current = userId;
    const cached = readAppCache(userId);
    if (cached) applyCacheSnapshot(cached);
    else setIsBootstrapped(true);
  }, [userId, applyCacheSnapshot]);

  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      if (wasAuthenticated.current && userId) {
        clearAppCache(userId);
      }
      wasAuthenticated.current = false;
      bootstrapStarted.current = false;
      hydratedUser.current = null;
      clearConfigSavedOnce();
      deletedDeliveries.current.clear();
      pendingDeliveries.current.clear();
      clearInflightCreates();
      setIsBootstrapped(false);
      setConfigComplete(null);
      setMeSettings(null);
      meSettingsRef.current = null;
      meLoadSeq.current += 1;
      return;
    }

    wasAuthenticated.current = true;
    if (!token && !session?.demo) return;
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;
    void bootstrap();
  }, [status, token, session?.demo, bootstrap, userId]);

  useEffect(() => {
    if (!isBootstrapped || !userId) return;
    schedulePersist(userId);
  }, [
    today,
    meSettings,
    deliveries,
    deliveriesDate,
    periodDeliveries,
    statsWeek,
    statsMonth,
    profileName,
    configComplete,
    isBootstrapped,
    userId,
    schedulePersist,
  ]);

  useEffect(() => {
    if (!isBootstrapped) return;
    void refreshDeliveries();
    void refreshPeriodDeliveries();
  }, [deliveriesDate, isBootstrapped, refreshDeliveries, refreshPeriodDeliveries]);

  useEffect(() => {
    if (!isBootstrapped) return;
    void refreshStats("week");
    void refreshStats("month");
  }, [deliveriesDate, isBootstrapped, refreshStats]);

  useEffect(() => {
    registerAppSyncPersist(() => {
      if (userId) persistCacheNow(userId);
    });
    return () => registerAppSyncPersist(null);
  }, [userId, persistCacheNow]);

  useEffect(() => {
    if (!isBootstrapped || !userId) return;

    const unsubscribe = subscribeAppSync(applySyncDetail);

    const onStorage = (event: StorageEvent) => {
      if (event.key === appCacheStorageKey(userId)) {
        const cached = readAppCache(userId);
        if (cached) applyCacheSnapshot(cached);
      }
    };

    const burstRefreshFromExternal = () => {
      void reconcileDeliveriesIfIdle();
      window.setTimeout(() => void reconcileDeliveriesIfIdle(), 280);
      window.setTimeout(() => void reconcileDeliveriesIfIdle(), 650);
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      syncDeliveriesFilterDate();
      burstRefreshFromExternal();
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    window.addEventListener("focus", onVisible);

    let poll: ReturnType<typeof setInterval> | undefined;
    poll = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      reconcileDeliveriesIfIdle();
    }, POLL_MS);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.removeEventListener("focus", onVisible);
      if (poll) clearInterval(poll);
    };
  }, [
    applyCacheSnapshot,
    applySyncDetail,
    isBootstrapped,
    reconcileDeliveriesIfIdle,
    syncDeliveriesFilterDate,
    userId,
  ]);

  useEffect(() => {
    if (!isBootstrapped) return;
    syncDeliveriesFilterDate();
    const tick = setInterval(syncDeliveriesFilterDate, 60_000);
    return () => clearInterval(tick);
  }, [isBootstrapped, syncDeliveriesFilterDate]);

  const anchorDate = deliveriesDate || todayDateInputValue();
  const deviceToday = todayDateInputValue();
  const tombSet = useMemo(
    () => new Set(deletedDeliveries.current.toArray()),
    [deliveries, periodDeliveries],
  );

  const todayDeliveries = useMemo(
    () =>
      selectDeliveriesForDate(
        deliveries,
        periodDeliveries,
        deviceToday,
        tombSet,
      ),
    [deliveries, periodDeliveries, deviceToday, tombSet],
  );

  const liveStatsWeek = useMemo(
    () =>
      mergeLivePeriodStats(
        normalizePeriodStats(statsWeek, "week", anchorDate),
        periodDeliveries,
        "week",
        anchorDate,
        tombSet,
      ),
    [statsWeek, periodDeliveries, anchorDate, tombSet],
  );

  const liveStatsMonth = useMemo(
    () =>
      mergeLivePeriodStats(
        normalizePeriodStats(statsMonth, "month", anchorDate),
        periodDeliveries,
        "month",
        anchorDate,
        tombSet,
      ),
    [statsMonth, periodDeliveries, anchorDate, tombSet],
  );

  const value = useMemo(
    () => ({
      today,
      profileName,
      deliveries,
      todayDeliveries,
      deliveriesDate,
      setDeliveriesDate,
      syncDeliveriesFilterDate,
      statsWeek,
      statsMonth,
      periodDeliveries,
      liveStatsWeek,
      liveStatsMonth,
      isBootstrapped,
      configComplete,
      meSettings,
      meSettingsLoading,
      loadMeSettings,
      saveMeSettings,
      refreshToday,
      refreshDeliveries,
      refreshStats,
      refreshConfigStatus,
      applyDeliveryOptimistic,
      upsertDeliveryOptimistic,
      removeDeliveryOptimistic,
      patchDeliveryInList,
      publishAppSync,
      scheduleDeliveryReconcile,
      markDeliveryCancelled,
      isDeliveryCancelled,
    }),
    [
      today,
      profileName,
      deliveries,
      todayDeliveries,
      deliveriesDate,
      syncDeliveriesFilterDate,
      statsWeek,
      statsMonth,
      periodDeliveries,
      liveStatsWeek,
      liveStatsMonth,
      isBootstrapped,
      configComplete,
      meSettings,
      meSettingsLoading,
      loadMeSettings,
      saveMeSettings,
      refreshToday,
      refreshDeliveries,
      refreshStats,
      refreshConfigStatus,
      applyDeliveryOptimistic,
      upsertDeliveryOptimistic,
      removeDeliveryOptimistic,
      patchDeliveryInList,
      publishAppSync,
      scheduleDeliveryReconcile,
      markDeliveryCancelled,
      isDeliveryCancelled,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData deve ser usado dentro de AppDataProvider");
  }
  return ctx;
}
