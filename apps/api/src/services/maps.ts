import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";

export interface OptimizedRoute {
  orderedAddresses: string[];
  totalKm: number;
  totalMin: number;
  googleMapsUrl: string;
  wazeUrl: string;
  source: "google";
}

export class RouteMapsError extends Error {
  constructor(
    message: string,
    public code:
      | "MAPS_NOT_CONFIGURED"
      | "INVALID_ADDRESS"
      | "GEOCODE_FAILED"
      | "ROUTE_NOT_FOUND"
      | "MAPS_API_ERROR",
    public details?: string[],
  ) {
    super(message);
    this.name = "RouteMapsError";
  }
}

type GeocodedPoint = {
  input: string;
  formatted: string;
  lat: number;
  lng: number;
};

function validateAddressInput(raw: string): string | null {
  const address = raw.trim();
  if (address.length < 8) {
    return "Endereço muito curto. Use rua, número, bairro e cidade.";
  }
  if (/^\d{5,8}$/.test(address)) {
    return "CEP sozinho não basta — inclua rua e cidade.";
  }
  if (/^[a-zA-Z0-9]+$/i.test(address) && !/\d/.test(address) && address.length < 12) {
    return "Endereço inválido. Informe rua, número e cidade.";
  }
  if (!/[,\s]/.test(address) && address.length < 15 && !/\d/.test(address)) {
    return "Endereço incompleto. Ex.: Rua das Flores, 120, São Paulo";
  }
  return null;
}

async function geocodeAddress(
  address: string,
  apiKey: string,
): Promise<GeocodedPoint | null> {
  const params = new URLSearchParams({
    address,
    key: apiKey,
    region: "br",
    language: "pt-BR",
    components: "country:BR",
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
  );
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
    error_message?: string;
  };

  if (data.status !== "OK" || !data.results?.[0]) {
    return null;
  }

  const hit = data.results[0];
  return {
    input: address,
    formatted: hit.formatted_address,
    lat: hit.geometry.location.lat,
    lng: hit.geometry.location.lng,
  };
}

function buildGoogleMapsDirUrl(points: GeocodedPoint[]): string {
  return `https://www.google.com/maps/dir/${points
    .map((p) => encodeURIComponent(`${p.lat},${p.lng}`))
    .join("/")}`;
}

function buildWazeUrl(point: GeocodedPoint): string {
  return `https://waze.com/ul?ll=${point.lat},${point.lng}&navigate=yes`;
}

function mapDirectionsStatus(status: string): string {
  const map: Record<string, string> = {
    NOT_FOUND:
      "Não encontramos um dos endereços. Confira rua, número e cidade.",
    ZERO_RESULTS: "Não há rota entre esses endereços.",
    MAX_WAYPOINTS_EXCEEDED: "Muitos endereços na mesma rota.",
    INVALID_REQUEST: "Pedido inválido para o Google Maps.",
    OVER_QUERY_LIMIT: "Limite da API do Google Maps atingido. Tente mais tarde.",
    REQUEST_DENIED:
      "Google Maps recusou a requisição. Verifique a chave e as APIs ativas.",
    UNKNOWN_ERROR: "Erro temporário no Google Maps. Tente de novo.",
  };
  return map[status] ?? `Google Maps: ${status}`;
}

export async function optimizeRoute(
  addresses: string[],
  env: Env,
  log: FastifyBaseLogger,
): Promise<OptimizedRoute> {
  const trimmed = addresses.map((a) => a.trim()).filter(Boolean);
  if (trimmed.length < 2) {
    throw new RouteMapsError(
      "Informe pelo menos 2 endereços para montar a rota.",
      "INVALID_ADDRESS",
    );
  }

  const validationErrors: string[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    const err = validateAddressInput(trimmed[i]!);
    if (err) validationErrors.push(`Endereço ${i + 1}: ${err}`);
  }
  if (validationErrors.length > 0) {
    throw new RouteMapsError(
      "Alguns endereços estão inválidos.",
      "INVALID_ADDRESS",
      validationErrors,
    );
  }

  if (!env.GOOGLE_MAPS_API_KEY?.trim()) {
    throw new RouteMapsError(
      "Roteirização real não está ativa: configure GOOGLE_MAPS_API_KEY na API (Geocoding + Directions).",
      "MAPS_NOT_CONFIGURED",
    );
  }

  const apiKey = env.GOOGLE_MAPS_API_KEY.trim();
  const geocoded: GeocodedPoint[] = [];
  const geocodeFailures: string[] = [];

  for (let i = 0; i < trimmed.length; i++) {
    const point = await geocodeAddress(trimmed[i]!, apiKey);
    if (!point) {
      geocodeFailures.push(
        `Endereço ${i + 1} (“${trimmed[i]}”) não foi encontrado no mapa.`,
      );
      continue;
    }
    geocoded.push(point);
  }

  if (geocodeFailures.length > 0) {
    throw new RouteMapsError(
      "Não foi possível localizar todos os endereços.",
      "GEOCODE_FAILED",
      geocodeFailures,
    );
  }

  const origin = geocoded[0]!;
  const destination = geocoded[geocoded.length - 1]!;
  const middle = geocoded.slice(1, -1);

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    key: apiKey,
    language: "pt-BR",
    region: "br",
  });
  if (middle.length > 0) {
    params.set(
      "waypoints",
      `optimize:true|${middle.map((p) => `${p.lat},${p.lng}`).join("|")}`,
    );
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params}`,
  );
  const data = (await res.json()) as {
    routes?: Array<{
      legs?: Array<{ distance: { value: number }; duration: { value: number } }>;
      waypoint_order?: number[];
    }>;
    status: string;
    error_message?: string;
  };

  if (data.status !== "OK" || !data.routes?.[0]) {
    log.warn(
      { status: data.status, error: data.error_message },
      "Google Directions failed",
    );
    throw new RouteMapsError(
      mapDirectionsStatus(data.status),
      data.status === "NOT_FOUND" || data.status === "ZERO_RESULTS"
        ? "ROUTE_NOT_FOUND"
        : "MAPS_API_ERROR",
      data.error_message ? [data.error_message] : undefined,
    );
  }

  const route = data.routes[0];
  const legs = route.legs ?? [];
  const totalKm =
    legs.reduce((s, l) => s + (l.distance?.value ?? 0), 0) / 1000;
  const totalMin = Math.round(
    legs.reduce((s, l) => s + (l.duration?.value ?? 0), 0) / 60,
  );

  const waypointOrder = route.waypoint_order ?? [];
  const orderedMiddle =
    middle.length > 0
      ? waypointOrder.map((i) => middle[i]!).filter(Boolean)
      : [];

  const orderedPoints = [origin, ...orderedMiddle, ...(geocoded.length > 1 ? [destination] : [])];
  const orderedAddresses = orderedPoints.map((p) => p.formatted);

  return {
    orderedAddresses,
    totalKm,
    totalMin,
    googleMapsUrl: buildGoogleMapsDirUrl(orderedPoints),
    wazeUrl: buildWazeUrl(origin),
    source: "google",
  };
}
