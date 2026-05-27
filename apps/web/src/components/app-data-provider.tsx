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
import { useSession } from "next-auth/react";
import type { PeriodStats, TodaySummary } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import {
  APP_SYNC_BRIDGE_KEY,
  APP_SYNC_EVENT,
  type AppSyncDetail,
  type AppSyncTopic,
  shouldHandleSync,
} from "@/lib/app-sync";
import {
  applyDeliveryToToday,
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
import { notifyAppSync } from "@/lib/app-sync";
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
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
const POLL_MS = 60_000;
const RECONCILE_MS = 800;

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
  const meLoadSeq = useRef(0);
  const hydratedUser = useRef<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef({
    today,
    profileName,
    deliveries,
    deliveriesDate,
    statsWeek,
    configComplete,
    meSettings,
  });
  stateRef.current = {
    today,
    profileName,
    deliveries,
    deliveriesDate,
    statsWeek,
    configComplete,
    meSettings,
  };

  const persistNow = useCallback(
    (uid: string) => {
      const s = stateRef.current;
      writeAppCache(uid, {
        today: s.today,
        meSettings: s.meSettings,
        deliveries: s.deliveries,
        deliveriesDate: s.deliveriesDate,
        statsWeek: s.statsWeek,
        profileName: s.profileName,
        configComplete: s.configComplete,
      });
    },
    [],
  );

  const schedulePersist = useCallback(
    (uid: string) => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        persistTimer.current = null;
        persistNow(uid);
      }, 120);
    },
    [persistNow],
  );

  const applyCacheSnapshot = useCallback((cached: PersistedAppCache) => {
    if (cached.today) setToday(cached.today);
    if (cached.meSettings) {
      setMeSettings(cached.meSettings);
      meSettingsRef.current = cached.meSettings;
      setConfigComplete(
        cached.configComplete ?? isServerConfigComplete(cached.meSettings),
      );
    }
    if (cached.deliveries.length > 0) setDeliveries(cached.deliveries);
    setDeliveriesDate(cached.deliveriesDate || todayDateInputValue());
    if (cached.statsWeek) setStatsWeek(cached.statsWeek);
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
    try {
      const data = await api<TodaySummary>("/me/today");
      setToday(data);
      if (userId) schedulePersist(userId);
    } catch {
      /* mantém cache */
    }
  }, [api, schedulePersist, userId]);

  const applyDeliveryOptimistic = useCallback(
    (delivery: CreatedDelivery) => {
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

      if (isIsoOnDateInput(occurredAt, todayKey)) {
        setToday((prev) => {
          const base = prev ?? emptyTodaySummary();
          if (base.recentDeliveries.some((r) => r.id === item.id)) return base;
          return applyDeliveryToToday(base, { ...delivery, occurredAt });
        });
      }

      setDeliveriesDate((current) => {
        const filter = isIsoOnDateInput(occurredAt, todayKey)
          ? todayKey
          : current || todayKey;
        if (isIsoOnDateInput(occurredAt, filter)) {
          setDeliveries((prev) => {
            if (prev.some((x) => x.id === item.id)) return prev;
            return [item, ...prev];
          });
        }
        return filter;
      });

      if (userId) persistNow(userId);
    },
    [userId, persistNow],
  );

  const refreshDeliveries = useCallback(async () => {
    const date = deliveriesDate || todayDateInputValue();
    const q = `?date=${date}`;
    try {
      const r = await api<{ items: DeliveryListItem[] }>(`/me/deliveries${q}`);
      setDeliveries(r.items);
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
          if (userId) schedulePersist(userId);
        } else {
          setStatsMonth(data);
        }
      } catch {
        if (period === "week") setStatsWeek(null);
        else setStatsMonth(null);
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

  const saveMeSettings = useCallback(
    async (payload: ConfigSavePayload) => {
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
      notifyAppSync(["profile"]);
      void refreshToday();

      return {
        complete: snap ? isServerConfigComplete(snap) : false,
        me: snap,
      };
    },
    [api, loadMeSettings, refreshToday],
  );

  const queueConfigRefresh = useCallback(() => {
    if (configRefreshTimer.current) clearTimeout(configRefreshTimer.current);
    configRefreshTimer.current = setTimeout(() => {
      configRefreshTimer.current = null;
      void loadMeSettings({ force: true, silent: true });
    }, 400);
  }, [loadMeSettings]);

  const queueReconcile = useCallback(() => {
    if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
    reconcileTimer.current = setTimeout(() => {
      reconcileTimer.current = null;
      void Promise.all([
        refreshToday(),
        refreshDeliveries(),
        refreshStats("week"),
      ]);
    }, RECONCILE_MS);
  }, [refreshToday, refreshDeliveries, refreshStats]);

  const bootstrap = useCallback(async () => {
    setIsBootstrapped(true);
    const cached = userId ? readAppCache(userId) : null;
    const stale = !cached || isCacheStale(cached.savedAt, 45_000);

    await Promise.all([
      refreshToday(),
      loadMeSettings({ force: stale, silent: Boolean(cached) }),
      refreshDeliveries(),
      refreshStats("week"),
    ]);
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
    if (!isBootstrapped || !userId) return;

    const handleSyncDetail = (detail: AppSyncDetail | undefined) => {
      const incoming = detail?.topics ?? ["all"];

      if (detail?.delivery) {
        applyDeliveryOptimistic(detail.delivery);
        void refreshToday();
        return;
      }

      if (topicsMatch(["today", "deliveries", "stats", "all"], incoming)) {
        queueReconcile();
      }
      if (topicsMatch(["profile", "all"], incoming)) {
        queueConfigRefresh();
      }
    };

    const onSync = (event: Event) => {
      handleSyncDetail((event as CustomEvent<AppSyncDetail>).detail);
    };

    const onStorage = (event: StorageEvent) => {
      if (!userId) return;
      if (
        event.key !== appCacheStorageKey(userId) &&
        event.key !== APP_SYNC_BRIDGE_KEY
      ) {
        return;
      }
      const cached = readAppCache(userId);
      if (cached) applyCacheSnapshot(cached);
      if (event.key === APP_SYNC_BRIDGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as { detail?: AppSyncDetail };
          handleSyncDetail(parsed.detail);
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener(APP_SYNC_EVENT, onSync);
    window.addEventListener("storage", onStorage);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const cached = readAppCache(userId);
      if (cached) applyCacheSnapshot(cached);
      if (!cached || isCacheStale(cached.savedAt, 20_000)) {
        queueReconcile();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    let poll: ReturnType<typeof setInterval> | undefined;
    if (!SOCKET_ENABLED) {
      poll = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        queueReconcile();
      }, POLL_MS);
    }

    return () => {
      window.removeEventListener(APP_SYNC_EVENT, onSync);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      if (poll) clearInterval(poll);
    };
  }, [
    applyCacheSnapshot,
    applyDeliveryOptimistic,
    isBootstrapped,
    queueConfigRefresh,
    queueReconcile,
    refreshToday,
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
