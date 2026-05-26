import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";

export interface OptimizedRoute {
  orderedAddresses: string[];
  totalKm: number;
  totalMin: number;
  googleMapsUrl: string;
}

export async function optimizeRoute(
  addresses: string[],
  env: Env,
  log: FastifyBaseLogger,
): Promise<OptimizedRoute> {
  if (!env.GOOGLE_MAPS_API_KEY) {
    const ordered = [...addresses];
    const googleMapsUrl = `https://www.google.com/maps/dir/${ordered.map(encodeURIComponent).join("/")}`;
    return {
      orderedAddresses: ordered,
      totalKm: addresses.length * 3,
      totalMin: addresses.length * 8,
      googleMapsUrl,
    };
  }

  const origin = addresses[0]!;
  const destination = addresses[addresses.length - 1]!;
  const waypoints =
    addresses.length > 2
      ? `optimize:true|${addresses.slice(1, -1).join("|")}`
      : undefined;

  const params = new URLSearchParams({
    origin,
    destination,
    key: env.GOOGLE_MAPS_API_KEY,
  });
  if (waypoints) params.set("waypoints", waypoints);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params}`,
  );
  const data = (await res.json()) as {
    routes?: Array<{
      legs?: Array<{ distance: { value: number }; duration: { value: number } }>;
      waypoint_order?: number[];
    }>;
    status: string;
  };

  if (data.status !== "OK" || !data.routes?.[0]) {
    log.warn({ status: data.status }, "Google Maps fallback");
    const ordered = [...addresses];
    return {
      orderedAddresses: ordered,
      totalKm: addresses.length * 3,
      totalMin: addresses.length * 8,
      googleMapsUrl: `https://www.google.com/maps/dir/${ordered.map(encodeURIComponent).join("/")}`,
    };
  }

  const route = data.routes[0];
  const legs = route.legs ?? [];
  const totalKm =
    legs.reduce((s, l) => s + (l.distance?.value ?? 0), 0) / 1000;
  const totalMin = Math.round(
    legs.reduce((s, l) => s + (l.duration?.value ?? 0), 0) / 60,
  );

  const waypointOrder = route.waypoint_order ?? [];
  const middle = addresses.slice(1, -1);
  const orderedMiddle =
    middle.length > 0
      ? waypointOrder.map((i) => middle[i]!).filter(Boolean)
      : [];
  const orderedAddresses = [
    origin,
    ...orderedMiddle,
    ...(addresses.length > 1 ? [destination] : []),
  ];

  const googleMapsUrl = `https://www.google.com/maps/dir/${orderedAddresses.map(encodeURIComponent).join("/")}`;

  return { orderedAddresses, totalKm, totalMin, googleMapsUrl };
}
