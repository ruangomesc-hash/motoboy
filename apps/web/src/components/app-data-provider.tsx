"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type { PeriodStats, TodaySummary } from "@motoboy/types";
import { useApi } from "@/hooks/use-api";
import {
  APP_SYNC_EVENT,
  type AppSyncDetail,
  type AppSyncTopic,
  shouldHandleSync,
} from "@/lib/app-sync";
import { applyDeliveryToToday } from "@/lib/app-data-cache";
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

export type DeliveryListItem = {
  id: string;
  grossValue: string | number;
  originName: string | null;
  source: string;
  occurredAt: string;
  distanceKm?: string | number | null;
};

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
  loadMeSettings: (opts?: { force?: boolean }) => Promise<MeSettingsSnapshot | null>;
  saveMeSettings: (
    payload: ConfigSavePayload,
  ) => Promise<{ complete: boolean; me: MeSettingsSnapshot | null }>;
  refreshToday: () => Promise<void>;
  refreshDeliveries: () => Promise<void>;
  refreshStats: (period: "week" | "month") => Promise<void>;
  refreshConfigStatus: () => Promise<boolean>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
const POLL_MS = 20_000;

function topicsMatch(subscribed: AppSyncTopic[], incoming: AppSyncTopic[]): boolean {
  return shouldHandleSync(subscribed, incoming);
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const { status, data: session } = useSession();
  const token = session?.accessToken;
  const [today, setToday] = useState<TodaySummary | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [deliveriesDate, setDeliveriesDate] = useState("");
  const [statsWeek, setStatsWeek] = useState<PeriodStats | null>(null);
  const [statsMonth, setStatsMonth] = useState<PeriodStats | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [configComplete, setConfigComplete] = useState<boolean | null>(null);
  const [meSettings, setMeSettings] = useState<MeSettingsSnapshot | null>(null);
  const [meSettingsLoading, setMeSettingsLoading] = useState(false);
  const bootstrapStarted = useRef(false);
  const configRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meLoadSeq = useRef(0);

  const refreshToday = useCallback(async () => {
    try {
      const data = await api<TodaySummary>("/me/today");
      setToday(data);
    } catch {
      /* mantém cache anterior */
    }
  }, [api]);

  const refreshDeliveries = useCallback(async () => {
    const q = deliveriesDate ? `?date=${deliveriesDate}` : "";
    try {
      const r = await api<{ items: DeliveryListItem[] }>(`/me/deliveries${q}`);
      setDeliveries(r.items);
    } catch {
      setDeliveries([]);
    }
  }, [api, deliveriesDate]);

  const refreshStats = useCallback(
    async (period: "week" | "month") => {
      try {
        const data = await api<PeriodStats>(`/me/stats?period=${period}`);
        if (period === "week") setStatsWeek(data);
        else setStatsMonth(data);
      } catch {
        if (period === "week") setStatsWeek(null);
        else setStatsMonth(null);
      }
    },
    [api],
  );

  const applyMeSnapshot = useCallback((snap: MeSettingsSnapshot) => {
    setMeSettings(snap);
    const complete = isServerConfigComplete(snap);
    setConfigComplete(complete);
    setProfileName(snap.profile?.name ?? null);
    return complete;
  }, []);

  const loadMeSettings = useCallback(
    async (opts?: { force?: boolean }) => {
      if (status !== "authenticated") return null;
      if (!token && !session?.demo) return meSettings;

      if (!opts?.force && meSettings) return meSettings;

      const seq = ++meLoadSeq.current;
      setMeSettingsLoading(true);
      try {
        const data = await api<MeApiResponse>("/me");
        if (seq !== meLoadSeq.current) return null;
        const snap = parseMeSettings(data);
        applyMeSnapshot(snap);
        return snap;
      } catch {
        if (seq === meLoadSeq.current) setConfigComplete(false);
        return null;
      } finally {
        if (seq === meLoadSeq.current) setMeSettingsLoading(false);
      }
    },
    [api, applyMeSnapshot, meSettings, session?.demo, status, token],
  );

  const refreshConfigStatus = useCallback(async () => {
    const snap = await loadMeSettings({ force: true });
    return snap ? isServerConfigComplete(snap) : false;
  }, [loadMeSettings]);

  const saveMeSettings = useCallback(
    async (payload: ConfigSavePayload) => {
      await Promise.all([
        api("/me/profile", {
          method: "PUT",
          body: JSON.stringify(toProfilePutBody(payload.profile)),
        }, { skipSync: true }),
        api("/me/goals/plan", {
          method: "PUT",
          body: JSON.stringify(toGoalsPutBody(payload)),
        }, { skipSync: true }),
        api("/me/costs", {
          method: "PUT",
          body: JSON.stringify(toCostsPutBody(payload)),
        }, { skipSync: true }),
      ]);

      const snap = await loadMeSettings({ force: true });
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
      void loadMeSettings({ force: true });
    }, 400);
  }, [loadMeSettings]);

  const bootstrap = useCallback(async () => {
    await Promise.all([refreshToday(), loadMeSettings({ force: true })]);
    setIsBootstrapped(true);
    void Promise.all([refreshDeliveries(), refreshStats("week")]);
  }, [refreshToday, loadMeSettings, refreshDeliveries, refreshStats]);

  useEffect(() => {
    if (status !== "authenticated") {
      bootstrapStarted.current = false;
      setIsBootstrapped(false);
      setConfigComplete(null);
      setMeSettings(null);
      meLoadSeq.current += 1;
      return;
    }
    if (!token && !session?.demo) return;
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;
    void bootstrap();
  }, [status, token, session?.demo, bootstrap]);

  useEffect(() => {
    if (!isBootstrapped) return;
    void refreshDeliveries();
  }, [deliveriesDate, isBootstrapped, refreshDeliveries]);

  useEffect(() => {
    if (!isBootstrapped) return;

    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<AppSyncDetail>).detail;
      const incoming = detail?.topics ?? ["all"];

      if (detail?.delivery) {
        setToday((prev) =>
          prev ? applyDeliveryToToday(prev, detail.delivery!) : prev,
        );
        const d = detail.delivery;
        const item: DeliveryListItem = {
          id: d.id,
          grossValue: d.grossValue,
          originName: d.originName ?? null,
          source: d.source,
          occurredAt: d.occurredAt ?? new Date().toISOString(),
          distanceKm: d.distanceKm ?? null,
        };
        setDeliveries((prev) => {
          if (prev.some((x) => x.id === item.id)) return prev;
          return [item, ...prev];
        });
      }

      if (topicsMatch(["today", "deliveries", "stats", "all"], incoming)) {
        void refreshToday();
      }
      if (topicsMatch(["deliveries", "today", "all"], incoming)) {
        void refreshDeliveries();
      }
      if (topicsMatch(["stats", "today", "all"], incoming)) {
        void Promise.all([refreshStats("week"), refreshStats("month")]);
      }
      if (topicsMatch(["profile", "all"], incoming)) {
        queueConfigRefresh();
      }
    };

    window.addEventListener(APP_SYNC_EVENT, onSync);
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void refreshToday();
      void refreshDeliveries();
    };
    document.addEventListener("visibilitychange", onVisible);

    let poll: ReturnType<typeof setInterval> | undefined;
    if (!SOCKET_ENABLED) {
      poll = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        void refreshToday();
        void refreshDeliveries();
      }, POLL_MS);
    }

    return () => {
      window.removeEventListener(APP_SYNC_EVENT, onSync);
      document.removeEventListener("visibilitychange", onVisible);
      if (poll) clearInterval(poll);
    };
  }, [
    isBootstrapped,
    refreshToday,
    refreshDeliveries,
    refreshStats,
    queueConfigRefresh,
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
