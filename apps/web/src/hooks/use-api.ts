"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { notifyAppSync, syncTopicsForPath } from "@/lib/app-sync";
import { demoFetch } from "@/lib/demo-data";

export function useApi() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const isDemo = session?.demo === true;

  return useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const method = (options.method ?? "GET").toUpperCase();
      const result = isDemo
        ? await demoFetch<T>(path, options)
        : await apiFetch<T>(path, {
            ...options,
            headers: {
              ...options.headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
      const syncTopics = syncTopicsForPath(path, method);
      if (syncTopics.length > 0) {
        const delivery =
          method === "POST" &&
          path.includes("/deliveries") &&
          result &&
          typeof result === "object" &&
          "id" in (result as object)
            ? (result as {
                id: string;
                grossValue: number | string;
                source: string;
                originName?: string | null;
                occurredAt?: string;
                distanceKm?: number | string | null;
              })
            : undefined;
        notifyAppSync(syncTopics, delivery ? { delivery } : undefined);
      }
      return result;
    },
    [token, isDemo],
  );
}

export function useIsDemoMode(): boolean {
  const { data: session } = useSession();
  return session?.demo === true;
}
