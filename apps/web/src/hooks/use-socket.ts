"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { notifyAppSync } from "@/lib/app-sync";
import { deliveryFromApiRow } from "@/lib/app-data-cache";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";

function resolveSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3001";
}

function syncDeliveryFromSocket(payload: unknown): void {
  const row =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  const delivery = row ? deliveryFromApiRow(row) : undefined;
  notifyAppSync(DELIVERY_SYNC_TOPICS, {
    ...(delivery ? { delivery } : {}),
    skipReconcile: false,
  });
}

function syncDeliveryDeletedFromSocket(payload: unknown): void {
  const id =
    payload &&
    typeof payload === "object" &&
    typeof (payload as { id?: unknown }).id === "string"
      ? (payload as { id: string }).id
      : undefined;
  notifyAppSync(DELIVERY_SYNC_TOPICS, {
    ...(id ? { removedDeliveryId: id } : {}),
    skipReconcile: false,
  });
}

export function useSocket(userId: string | undefined, enabled = true): void {
  const { data: session } = useSession();
  const token = session?.accessToken;

  useEffect(() => {
    if (!SOCKET_ENABLED || !userId || !enabled || !token) return;
    let socket: Socket | undefined;
    socket = io(resolveSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("delivery:created", syncDeliveryFromSocket);
    socket.on("delivery:updated", syncDeliveryFromSocket);
    socket.on("delivery:deleted", syncDeliveryDeletedFromSocket);
    socket.on("fuel:refuel", () => notifyAppSync(["today", "stats", "all"]));
    socket.on("odometer:updated", () => notifyAppSync(["today", "all"]));

    return () => {
      socket?.disconnect();
    };
  }, [userId, enabled, token]);
}
