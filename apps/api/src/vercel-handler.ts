import type { FastifyInstance } from "fastify";

type InjectMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";
import { createApp } from "./create-app.js";

let appPromise: Promise<FastifyInstance> | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    appPromise = createApp({ logger: process.env.NODE_ENV !== "production" });
    const app = await appPromise;
    await app.ready();
  }
  return appPromise;
}

function buildInjectUrl(pathSegments: string[] | undefined, search: string): string {
  const path = pathSegments?.length ? `/${pathSegments.join("/")}` : "/";
  return search ? `${path}${search}` : path;
}

export async function handleBackendRequest(
  request: Request,
  pathSegments: string[] | undefined,
): Promise<Response> {
  const app = await getApp();
  const url = new URL(request.url);
  const injectUrl = buildInjectUrl(pathSegments, url.search);

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let payload: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    payload = await request.text();
  }

  const allowedMethods: InjectMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
  ];
  const method: InjectMethod = allowedMethods.includes(
    request.method as InjectMethod,
  )
    ? (request.method as InjectMethod)
    : "GET";

  const result = (await app.inject({
    method,
    url: injectUrl,
    headers,
    payload,
  })) as unknown as {
    statusCode: number;
    body: string;
    headers: Record<string, string | string[] | undefined>;
  };

  const responseHeaders = new Headers();
  for (const [key, value] of Object.entries(result.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => responseHeaders.append(key, v));
    } else {
      responseHeaders.set(key, String(value));
    }
  }

  return new Response(result.body ?? "", {
    status: result.statusCode,
    headers: responseHeaders,
  });
}
