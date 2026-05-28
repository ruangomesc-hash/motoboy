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
  type Dispatch,
  type SetStateAction,
} from "react";
import { flushSync } from "react-dom";
import { useSession } from "next-auth/react";
import type { PeriodStats, TodaySummary } from "@motoboy/types";
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
import {
  buildPreviewPeriodStats,
  isInStatsPeriod,
  patchPeriodStatsDelivery,
} from "@/lib/stats-preview";
import { createDeletedDeliveryRegistry } from "@/lib/deleted-delivery-tombstones";
import { createPendingDeliveryRegistry } from "@/lib/pending-delivery-registry";
import { clearInflightCreates } from "@/lib/inflight-delivery-create";
import { resolveDeliveryPayload } from "@/lib/resolve-delivery-payload";
import {
  dedupeRecentDeliveries,
  mergeDeliveryLists,
  mergeTodayFromServer,
} from "@/lib/merge-app-data";
import { recomputeTodayFromDeliveries } from "@/lib/today-recent-from-deliveries";

export type { DeliveryListItem };

type AppDataContextValue = {
  today: TodaySummary | null;
  profileName: string | null;
  deliveries: DeliveryListItem[];
  deliveriesDate: string;
  setDeliveriesDate: (date: string) => void;
  statsWeek: PeriodStats | null;
  statsMonth: PeriodStats | null;
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
const POLL_MS = 120_000;
const MUTATION_SETTLE_MS = 8_000;
const OWN_SYNC_KEY_TTL_MS = 1_500;

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
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [configComplete, setConfigComplete] = useState<boolean | null>(null);
  const [meSettings, setMeSettings] = useState<MeSettingsSnapshot | null>(null);
  const [meSettingsLoading, setMeSettingsLoading] = useState(false);

  const meSettingsRef = useRef<MeSettingsSnapshot | null>(null);
  const bootstrapStarted = useRef(false);
  const configRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meLoadSeq = useRef(0);
  const deliveriesFetchSeq = useRef(0);
  const deliveryMutationGen = useRef(0);
  const ownSyncKeys = useRef(new Set<string>());
  const mutationSettleTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hydratedUser = useRef<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deletedDeliveries = useRef(createDeletedDeliveryRegistry());
  const pendingDeliveries = useRef(createPendingDeliveryRegistry());
  /** Evita aplicar delta de stats duas vezes (ação local + evento sync na mesma aba). */
  const statsRemoveAdjusted = useRef(new Set<string>());

  const stateRef = useRef({
    today,
    profileName,
    deliveries,
    deliveriesDate,
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
      deliveriesDate: s.deliveriesDate,
      statsWeek: s.statsWeek,
      statsMonth: s.statsMonth,
      profileName: s.profileName,
      configComplete: s.configComplete,
      deletedDeliveryIds: deletedDeliveries.current.toArray(),
    });
  }, []);

  const persistNow = persistCacheNow;

  const bumpDeliveryMutation = useCallback(() => {
    deliveryMutationGen.current += 1;
    if (mutationSettleTimer.current) {
      clearTimeout(mutationSettleTimer.current);
    }
    mutationSettleTimer.current = setTimeout(() => {
      mutationSettleTimer.current = null;
      if (pendingDeliveries.current.hasLocal()) return;
      const gen = deliveryMutationGen.current;
      void (async () => {
        await Promise.all([
          refreshTodayRef.current?.(gen),
          refreshDeliveriesRef.current?.(gen),
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
    setDeliveriesDate(cached.deliveriesDate || todayDateInputValue());
    if (cached.statsWeek) setStatsWeek(cached.statsWeek);
    if (cached.statsMonth) setStatsMonth(cached.statsMonth);
    if (cached.profileName) setProfileName(cached.profileName);
    setIsBootstrapped(true);
  }, []);

  const applyMeSnapshot = useCallback((snap: MeSettingsSnapshot) => {
    setMeSettings(snap);
    meSettingsRef.current = snap;
    const complete = isServerConfigComplete(snap);
    setConfigComplete(complete);
    setProfileName(snap.profile?.name ?? null);
    return complete;
  }, []);

  const refreshToday = useCallback(
    async (mutationGenAtStart?: number) => {
      const genAtStart = mutationGenAtStart ?? deliveryMutationGen.current;
      try {
        const data = await api<TodaySummary>("/me/today");
        if (genAtStart !== deliveryMutationGen.current) return;

        const tomb = deletedDeliveries.current;
        const todayKey = todayDateInputValue();
        const tombSet = new Set(tomb.toArray());

        setToday((prev) => {
          const fromServer = tomb.applyToTodaySummary(data);
          const merged = mergeTodayFromServer(
            fromServer,
            prev,
            tombSet,
            todayKey,
          );
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

  const applyStatsDelta = useCallback(
    (
      occurredAt: string,
      delta: { gross: number; km: number; count: number },
    ) => {
      const costsConfigured =
        stateRef.current.today?.costsConfigured ?? false;

      const bump = (
        period: "week" | "month",
        setter: Dispatch<SetStateAction<PeriodStats | null>>,
      ) => {
        if (!isInStatsPeriod(occurredAt, period)) return;
        setter((prev) => {
          const fallback = buildPreviewPeriodStats(
            period,
            stateRef.current.deliveries,
            stateRef.current.today,
            prev,
          );
          const base = prev ?? fallback;
          return patchPeriodStatsDelivery(base, delta, costsConfigured);
        });
      };

      bump("week", setStatsWeek);
      bump("month", setStatsMonth);
      if (userId) schedulePersist(userId);
    },
    [schedulePersist, userId],
  );

  const upsertDeliveryOptimistic = useCallback(
    (delivery: CreatedDelivery, previous?: CreatedDelivery) => {
      deletedDeliveries.current.unmark(delivery.id);
      statsRemoveAdjusted.current.delete(delivery.id);
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

      flushSync(() => {
        const prevList = stateRef.current.deliveries;
        let nextDeliveries =
          prevPayload && prevPayload.id !== item.id
            ? prevList.filter((d) => d.id !== prevPayload.id)
            : prevList;
        const idx = nextDeliveries.findIndex((d) => d.id === item.id);
        if (idx >= 0) {
          const next = [...nextDeliveries];
          next[idx] = item;
          nextDeliveries = next;
        } else {
          nextDeliveries = [item, ...nextDeliveries];
        }

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
          today: nextToday,
          deliveriesDate: nextDate,
        };
        setDeliveries(nextDeliveries);
        setDeliveriesDate(nextDate);
        setToday(nextToday);
      });

      const idReplaced = Boolean(
        prevPayload && prevPayload.id !== item.id,
      );
      const newGross = Number(delivery.grossValue);
      const oldGross = prevPayload ? Number(prevPayload.grossValue) : 0;
      const newKm =
        delivery.distanceKm != null ? Number(delivery.distanceKm) : 0;
      const oldKm =
        prevPayload?.distanceKm != null ? Number(prevPayload.distanceKm) : 0;
      applyStatsDelta(occurredAt, {
        gross: newGross - oldGross,
        km: newKm - oldKm,
        count: prevPayload && !idReplaced ? 0 : 1,
      });

      if (userId) persistCacheNow(userId);
      bumpDeliveryMutation();
    },
    [userId, persistCacheNow, applyStatsDelta, bumpDeliveryMutation],
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

      const payload = resolveDeliveryPayload(deliveryId, {
        deliveries: s.deliveries,
        today: s.today,
        fallback,
      });

      const nextDeliveries = s.deliveries.filter((d) => d.id !== deliveryId);
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
          today: nextToday,
        };
        setDeliveries(nextDeliveries);
        setToday(nextToday);
      });

      if (
        payload &&
        !statsRemoveAdjusted.current.has(deliveryId)
      ) {
        statsRemoveAdjusted.current.add(deliveryId);
        const gross = Number(payload.grossValue);
        const km =
          payload.distanceKm != null ? Number(payload.distanceKm) : 0;
        applyStatsDelta(payload.occurredAt ?? new Date().toISOString(), {
          gross: -gross,
          km: -km,
          count: -1,
        });
      }

      if (userId) persistCacheNow(userId);
      bumpDeliveryMutation();
    },
    [userId, persistCacheNow, applyStatsDelta, bumpDeliveryMutation],
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
    async (mutationGenAtStart?: number) => {
      const genAtStart = mutationGenAtStart ?? deliveryMutationGen.current;
      const date = deliveriesDate || todayDateInputValue();
      const seq = ++deliveriesFetchSeq.current;
      const q = `?date=${date}`;
      try {
        const r = await api<{ items: DeliveryListItem[] }>(`/me/deliveries${q}`);
        if (seq !== deliveriesFetchSeq.current) return;
        if (genAtStart !== deliveryMutationGen.current) return;

        const tomb = deletedDeliveries.current;
        const tombSet = new Set(tomb.toArray());
        const items = tomb.filter(r.items);
        setDeliveries((prev) => mergeDeliveryLists(items, prev, date, tombSet));

        if (genAtStart === deliveryMutationGen.current) {
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

  const refreshStats = useCallback(
    async (period: "week" | "month") => {
      const genAtStart = deliveryMutationGen.current;
      try {
        const data = await api<PeriodStats>(`/me/stats?period=${period}`);
        if (genAtStart !== deliveryMutationGen.current) return;
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
    [api, schedulePersist, userId],
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
        if (seq === meLoadSeq.current && !cached) setConfigComplete(false);
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

  const reconcileDeliveriesIfIdle = useCallback(() => {
    if (pendingDeliveries.current.hasLocal()) return;
    const gen = deliveryMutationGen.current;
    void refreshToday(gen);
    void refreshDeliveries(gen);
  }, [refreshDeliveries, refreshToday]);

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
        scheduleDeliveryReconcile();
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
      upsertDeliveryOptimistic,
      userId,
    ],
  );

  const saveMeSettings = useCallback(
    async (payload: ConfigSavePayload) => {
      const current = meSettingsRef.current;
      if (current) {
        const optimistic: MeSettingsSnapshot = {
          profile: {
            ...current.profile,
            ...toProfilePutBody(payload.profile),
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
            body: JSON.stringify(toProfilePutBody(payload.profile)),
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
    [api, applyMeSnapshot, persistNow, publishAppSync, userId],
  );

  const bootstrap = useCallback(() => {
    const pending = readPendingRegistrationProfile();
    if (pending && !meSettingsRef.current) {
      applyMeSnapshot(buildOptimisticMeFromPending(pending));
    }

    const cached = userId ? readAppCache(userId) : null;
    const stale = !cached || isCacheStale(cached.savedAt, 45_000);

    void loadMeSettings({
      force: stale || Boolean(pending),
      silent: Boolean(cached || pending),
    });

    requestAnimationFrame(() => {
      void refreshToday();
      void refreshDeliveries();
      void refreshStats("week");
      void refreshStats("month");
    });
  }, [
    applyMeSnapshot,
    loadMeSettings,
    refreshDeliveries,
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
  }, [deliveriesDate, isBootstrapped, refreshDeliveries]);

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

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const cached = readAppCache(userId);
      if (!cached || isCacheStale(cached.savedAt, 12_000)) {
        reconcileDeliveriesIfIdle();
      }
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    window.addEventListener("focus", onVisible);

    let poll: ReturnType<typeof setInterval> | undefined;
    if (!SOCKET_ENABLED) {
      poll = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        reconcileDeliveriesIfIdle();
      }, POLL_MS);
    }

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
    userId,
  ]);

  const value = useMemo(
    () => ({
      today,
      profileName,
      deliveries,
      deliveriesDate,
      setDeliveriesDate,
      statsWeek,
      statsMonth,
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
      deliveriesDate,
      statsWeek,
      statsMonth,
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
