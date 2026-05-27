const path = require("path");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable:
    process.env.NODE_ENV === "development" || process.env.VERCEL === "1",
});

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
    // Monorepo: inclui arquivos fora de apps/web no tracing do bundle serverless.
    outputFileTracingRoot: path.join(__dirname, "../.."),
    serverComponentsExternalPackages: [
      "@prisma/client",
      "bullmq",
      "ioredis",
    ],
  },
  webpack: (config, { isServer }) => {
    // API usa imports ESM com sufixo .js (NodeNext); o Next resolve para .ts no bundle.
    if (isServer) {
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js"],
      };
    }
    return config;
  },
  async rewrites() {
    // Produção (Vercel): /api/backend/* é atendido por Route Handlers (mesmo domínio → Supabase).
    if (process.env.VERCEL === "1") {
      return [];
    }
    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
