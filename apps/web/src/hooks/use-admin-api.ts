"use client";

import { useSession } from "next-auth/react";
import { useCallback, useRef, type RefObject } from "react";
import type { Session } from "next-auth";
import { apiFetch } from "@/lib/api";
import { adminDemoFetch } from "@/lib/admin-demo-data";

async function waitForAdminSession(
  statusRef: RefObject<"loading" | "authenticated" | "unauthenticated">,
  sessionRef: RefObject<Session | null>,
  timeoutMs = 8_000,
): Promise<Session> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = statusRef.current;
    const session = sessionRef.current;
    if (
      status === "authenticated" &&
      session?.isAdmin &&
      session.accessToken
    ) {
      return session;
    }
    if (status === "unauthenticated") {
      throw new Error("Sessão admin inválida");
    }
    await new Promise((r) => setTimeout(r, 40));
  }
  throw new Error("Sessão admin inválida");
}

export function useAdminSessionReady(): boolean {
  const { data: session, status } = useSession();
  return (
    status === "authenticated" &&
    Boolean(session?.isAdmin && session.accessToken)
  );
}

export function useAdminApi() {
  const { data: session, status } = useSession();
  const sessionRef = useRef(session);
  const statusRef = useRef(status);
  sessionRef.current = session;
  statusRef.current = status;
  return useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const active = await waitForAdminSession(statusRef, sessionRef);
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
