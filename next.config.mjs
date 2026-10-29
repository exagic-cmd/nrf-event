import i18nConfig from './next-i18next.config.js';
const { localeDetection, ...nextI18n } = i18nConfig.i18n;
let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: nextI18n,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'date-fns-tz',
      '@radix-ui/react-icons',
      'recharts',
    ],
  },
  async rewrites() {
    const reservedRoutes = [
      "accommodation",
      "agentAI",
      "affiliateProgram",
      "api",
      "chat",
      "checkout",
      "contactUs",
      "courses",
      "custom-booking",
      "day-tours",
      "error",
      "hotel",
      "landmark",
      "listings",
      "location-detail",
      "login",
      "order",
      "payment-failed",
      "payment-process",
      "payment-success",
      "profile",
      "resume-payment",
      "review",
      "rh",
      "shuttle",
      "stripe",
      "tour",
    ].join("|");

    return {
      beforeFiles: [
        {
          source: `/:slug((?!(?:${reservedRoutes})(?:/|$))[^/.]+)/:id*`,
          destination: "/:id*",
        },
      ],
    };
  },
};

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
