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
  type AppSyncDetail,
  type AppSyncTopic,
  notifyAppSync,
  registerAppSyncPersist,
  shouldHandleSync,
  subscribeAppSync,
} from "@/lib/app-sync";
import {
  applyDeliveryToToday,
  removeDeliveryFromToday,
  replaceDeliveryInToday,
  type CreatedDelivery,
} from "@/lib/app-data-cache";
import { emptyTodaySummary } from "@/lib/empty-today-summary";
import {
  isIsoOnDateInput,
  todayDateInputValue,
} from "@/lib/local-date";
import { isServerConfigComplete } from "@/lib/onboarding";
import {
  type ConfigSavePayload,
  type MeApiResponse,
  type MeSettingsSnapshot,
  parseMeSettings,
  toCostsPutBody,
  toGoalsPutBody,
  toProfilePutBody,
} from "@/lib/me-settings";
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
import { resolveDeliveryPayload } from "@/lib/resolve-delivery-payload";

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
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
const POLL_MS = 8_000;
const RECONCILE_MS = 60;
const BACKGROUND_RECONCILE_MS = 500;

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
  const reconcileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundReconcileTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const meLoadSeq = useRef(0);
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
      deliveries: s.deliveries,
      deliveriesDate: s.deliveriesDate,
      statsWeek: s.statsWeek,
      statsMonth: s.statsMonth,
      profileName: s.profileName,
      configComplete: s.configComplete,
      deletedDeliveryIds: deletedDeliveries.current.toArray(),
    });
  }, []);

  const persistNow = persistCacheNow;

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

  const refreshToday = useCallback(async () => {
    if (pendingDeliveries.current.hasLocal()) return;
    try {
      const data = await api<TodaySummary>("/me/today");
      const tomb = deletedDeliveries.current;
      const merged = tomb.applyToTodaySummary(data);
      setToday(merged);
      tomb.pruneConfirmedAbsent(merged.recentDeliveries.map((d) => d.id));
      if (userId) schedulePersist(userId);
    } catch {
      /* mantém cache */
    }
  }, [api, schedulePersist, userId]);

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
        setDeliveries((prev) => {
          let base =
            prevPayload && prevPayload.id !== item.id
              ? prev.filter((d) => d.id !== prevPayload.id)
              : prev;
          const idx = base.findIndex((d) => d.id === item.id);
          if (idx >= 0) {
            const next = [...base];
            next[idx] = item;
            return next;
          }
          return [item, ...base];
        });

        setDeliveriesDate((current) => {
          const filter = isIsoOnDateInput(occurredAt, todayKey)
            ? todayKey
            : current || todayKey;
          return filter;
        });

        setToday((prev) => {
          const base = prev ?? emptyTodaySummary();
          const nextPayload = { ...delivery, occurredAt };
          if (prevPayload) {
            const wasToday = isIsoOnDateInput(
              prevPayload.occurredAt ?? "",
              todayKey,
            );
            const isToday = isIsoOnDateInput(occurredAt, todayKey);
            const idChanged = prevPayload.id !== item.id;
            let working = base;
            if (idChanged && wasToday) {
              working = removeDeliveryFromToday(working, prevPayload);
            }
            if (wasToday && isToday && !idChanged) {
              return replaceDeliveryInToday(working, prevPayload, nextPayload);
            }
            if (wasToday && !isToday) {
              return idChanged ? working : removeDeliveryFromToday(base, prevPayload);
            }
            if (!wasToday && isToday) {
              if (working.recentDeliveries.some((r) => r.id === item.id)) {
                return working;
              }
              return applyDeliveryToToday(working, nextPayload);
            }
            return working;
          }
          if (!isIsoOnDateInput(occurredAt, todayKey)) return base;
          if (base.recentDeliveries.some((r) => r.id === item.id)) return base;
          return applyDeliveryToToday(base, nextPayload);
        });
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
    },
    [userId, persistCacheNow, applyStatsDelta],
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
      let nextToday = s.today;
      if (
        payload &&
        nextToday &&
        isIsoOnDateInput(payload.occurredAt ?? "", todayKey)
      ) {
        nextToday = removeDeliveryFromToday(nextToday, payload);
      }

      const listChanged = nextDeliveries.length !== s.deliveries.length;
      const todayChanged = nextToday !== s.today;

      stateRef.current = {
        ...s,
        deliveries: nextDeliveries,
        today: nextToday,
      };

      if (listChanged) setDeliveries(nextDeliveries);
      if (todayChanged) setToday(nextToday);

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
    },
    [userId, persistCacheNow, applyStatsDelta],
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

  const refreshDeliveries = useCallback(async () => {
    if (pendingDeliveries.current.hasLocal()) return;
    const date = deliveriesDate || todayDateInputValue();
    const q = `?date=${date}`;
    try {
      const r = await api<{ items: DeliveryListItem[] }>(`/me/deliveries${q}`);
      const tomb = deletedDeliveries.current;
      const items = tomb.filter(r.items);
      setDeliveries(items);
      tomb.pruneConfirmedAbsent(r.items.map((d) => d.id));
      if (userId) schedulePersist(userId);
    } catch {
      /* mantém cache */
    }
  }, [api, deliveriesDate, schedulePersist, userId]);

  const refreshStats = useCallback(
    async (period: "week" | "month") => {
      try {
        const data = await api<PeriodStats>(`/me/stats?period=${period}`);
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

  const loadMeSettings = useCallback(
    async (opts?: { force?: boolean; silent?: boolean }) => {
      if (status !== "authenticated") return null;
      if (!token && !session?.demo) return meSettingsRef.current;

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
      if (!opts?.silent && !cached) setMeSettingsLoading(true);
      try {
        const data = await api<MeApiResponse>("/me");
        if (seq !== meLoadSeq.current) return null;
        const snap = parseMeSettings(data);
        applyMeSnapshot(snap);
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

  const flushReconcile = useCallback(() => {
    if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
    reconcileTimer.current = setTimeout(() => {
      reconcileTimer.current = null;
      void Promise.all([
        refreshToday(),
        refreshDeliveries(),
        refreshStats("week"),
        refreshStats("month"),
      ]);
    }, RECONCILE_MS);
  }, [refreshToday, refreshDeliveries, refreshStats]);

  const scheduleBackgroundReconcile = useCallback(() => {
    if (backgroundReconcileTimer.current) {
      clearTimeout(backgroundReconcileTimer.current);
    }
    backgroundReconcileTimer.current = setTimeout(() => {
      backgroundReconcileTimer.current = null;
      flushReconcile();
    }, BACKGROUND_RECONCILE_MS);
  }, [flushReconcile]);

  const publishAppSync = useCallback(
    (
      topics: AppSyncTopic | AppSyncTopic[],
      extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
    ) => {
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

      if (detail.removedDeliveryId) {
        removeDeliveryOptimistic(
          detail.removedDeliveryId,
          detail.removedDelivery,
        );
      } else if (detail.delivery) {
        upsertDeliveryOptimistic(detail.delivery, detail.previousDelivery);
      }

      if (userId) persistCacheNow(userId);

      if (detail.skipReconcile) {
        return;
      }

      if (topicsMatch(["today", "deliveries", "stats", "all"], incoming)) {
        flushReconcile();
      }
      if (topicsMatch(["profile", "all"], incoming)) {
        queueConfigRefresh();
      }
    },
    [
      flushReconcile,
      persistCacheNow,
      queueConfigRefresh,
      removeDeliveryOptimistic,
      scheduleBackgroundReconcile,
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

      if (payload.saveCosts) {
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

      await Promise.all(requests);

      const snap = await loadMeSettings({ force: true, silent: true });
      publishAppSync(["profile", "today", "stats"], { skipReconcile: true });
      scheduleBackgroundReconcile();

      return {
        complete: snap ? isServerConfigComplete(snap) : false,
        me: snap,
      };
    },
    [
      api,
      applyMeSnapshot,
      loadMeSettings,
      persistNow,
      publishAppSync,
      scheduleBackgroundReconcile,
      userId,
    ],
  );

  const bootstrap = useCallback(() => {
    const cached = userId ? readAppCache(userId) : null;
    const stale = !cached || isCacheStale(cached.savedAt, 45_000);

    void refreshToday();
    void loadMeSettings({ force: stale, silent: Boolean(cached) });
    void refreshDeliveries();
    void refreshStats("week");
    void refreshStats("month");
  }, [loadMeSettings, refreshDeliveries, refreshStats, refreshToday, userId]);

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
      deletedDeliveries.current.clear();
      pendingDeliveries.current.clear();
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
      if (cached) applyCacheSnapshot(cached);
      if (!cached || isCacheStale(cached.savedAt, 12_000)) {
        flushReconcile();
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
        flushReconcile();
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
    flushReconcile,
    isBootstrapped,
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
