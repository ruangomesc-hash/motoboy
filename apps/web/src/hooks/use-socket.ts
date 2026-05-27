"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { notifyAppSync } from "@/lib/app-sync";

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";

function resolveSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3001";
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
    const bump = () => notifyAppSync("all");
    socket.on("delivery:created", bump);
    socket.on("delivery:deleted", bump);
    socket.on("fuel:refuel", bump);
    socket.on("odometer:updated", bump);
    return () => {
      socket?.disconnect();
    };
  }, [userId, enabled, token]);
}
