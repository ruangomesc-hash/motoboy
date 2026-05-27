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
import {
  isServerConfigComplete,
  type MeConfigSnapshot,
} from "@/lib/onboarding";

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
  const { status } = useSession();
  const [today, setToday] = useState<TodaySummary | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [deliveriesDate, setDeliveriesDate] = useState("");
  const [statsWeek, setStatsWeek] = useState<PeriodStats | null>(null);
  const [statsMonth, setStatsMonth] = useState<PeriodStats | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [configComplete, setConfigComplete] = useState<boolean | null>(null);
  const bootstrapStarted = useRef(false);

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

  const refreshConfigStatus = useCallback(async () => {
    try {
      const me = await api<MeConfigSnapshot>("/me");
      const complete = isServerConfigComplete(me);
      setConfigComplete(complete);
      setProfileName(me.profile?.name ?? null);
      return complete;
    } catch {
      setConfigComplete(false);
      return false;
    }
  }, [api]);

  const bootstrap = useCallback(async () => {
    await Promise.all([refreshToday(), refreshConfigStatus()]);
    setIsBootstrapped(true);
    void Promise.all([refreshDeliveries(), refreshStats("week")]);
  }, [refreshToday, refreshConfigStatus, refreshDeliveries, refreshStats]);

  useEffect(() => {
    if (status !== "authenticated") {
      bootstrapStarted.current = false;
      setIsBootstrapped(false);
      setConfigComplete(null);
      return;
    }
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;
    void bootstrap();
  }, [status, bootstrap]);

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
        void refreshConfigStatus();
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
    api,
    isBootstrapped,
    refreshToday,
    refreshDeliveries,
    refreshStats,
    refreshConfigStatus,
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
