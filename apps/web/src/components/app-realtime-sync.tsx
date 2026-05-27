"use client";

import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/use-socket";

export function AppRealtimeSync() {
  const { data: session, status } = useSession();
  useSocket(
    session?.userId,
    status === "authenticated" && !session?.demo && Boolean(session?.userId),
  );
  return null;
}
