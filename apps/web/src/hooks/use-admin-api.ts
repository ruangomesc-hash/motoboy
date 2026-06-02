"use client";

import { getSession, useSession } from "next-auth/react";
import { useCallback } from "react";
import type { Session } from "next-auth";
import { apiFetch } from "@/lib/api";
import { adminDemoFetch } from "@/lib/admin-demo-data";

async function resolveAdminSession(timeoutMs = 10_000): Promise<Session> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const session = await getSession();
    if (session?.isAdmin && session.accessToken) {
      return session;
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  throw new Error("Sessão admin inválida. Saia e entre de novo em /admin/login.");
}

export function useAdminSessionReady(): boolean {
  const { data: session, status } = useSession();
  if (status === "loading") return false;
  return Boolean(session?.isAdmin && session.accessToken);
}

export function useIsAdminDemoMode(): boolean {
  const { data: session } = useSession();
  return session?.adminDemo === true;
}

export function useAdminApi() {
  return useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const active = await resolveAdminSession();
      const token = active.accessToken!;
      if (active.adminDemo) {
        return adminDemoFetch<T>(path, options);
      }
      return apiFetch<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [],
  );
}
