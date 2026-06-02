const path = require("path");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable:
    process.env.NODE_ENV === "development" || process.env.VERCEL === "1",
});

let PrismaPlugin;
try {
  PrismaPlugin =
    require("@prisma/nextjs-monorepo-workaround-plugin").PrismaPlugin;
} catch {
  PrismaPlugin = null;
}

const tracingRoot = path.join(__dirname, "../..");
const prismaTraceGlobs = [
  "node_modules/.pnpm/**/node_modules/.prisma/**",
  "node_modules/.pnpm/**/node_modules/@prisma/client/**",
  "node_modules/.pnpm/**/node_modules/@prisma/engines/**",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""),
  },
  transpilePackages: [
    "@motoboy/types",
    "@motoboy/api",
    "@motoboy/db",
    "@motoboy/ai",
  ],
  experimental: {
    outputFileTracingRoot: tracingRoot,
    outputFileTracingIncludes: {
      "/api/backend/[...path]": prismaTraceGlobs,
      "/api/auth/[...nextauth]": prismaTraceGlobs,
    },
    // @prisma/client NÃO pode ser external — quebra o query engine no Vercel.
    serverComponentsExternalPackages: ["bullmq", "ioredis"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (PrismaPlugin) {
        config.plugins = [...(config.plugins || []), new PrismaPlugin()];
      }
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js"],
      };
    }
    return config;
  },
  async rewrites() {
    const socketUpstream =
      process.env.SOCKET_UPSTREAM_URL?.trim() ||
      process.env.RAILWAY_API_URL?.trim() ||
      (process.env.VERCEL === "1" ? undefined : process.env.API_URL?.trim());

    if (process.env.VERCEL === "1") {
      const rewrites = [];
      if (socketUpstream) {
        const base = socketUpstream.replace(/\/$/, "");
        rewrites.push({
          source: "/socket.io/:path*",
          destination: `${base}/socket.io/:path*`,
        });
      }
      return rewrites;
    }

    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${apiUrl}/socket.io/:path*`,
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
