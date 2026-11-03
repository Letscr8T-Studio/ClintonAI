import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Security headers for every response. The Content-Security-Policy is per request (it carries a
// nonce), so it's set in src/proxy.ts rather than here.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Sentry: reports go through our own /monitoring route (no CSP change, not blocked by ad
// blockers). Source maps upload only when SENTRY_AUTH_TOKEN (+ SENTRY_ORG, SENTRY_PROJECT) is set.
// Builds only: on the dev server the wrapper makes Fast Refresh reload pages in a loop, and
// there is nothing to report from dev anyway.
const withSentry = (config: NextConfig) =>
  withSentryConfig(config, {
    tunnelRoute: "/monitoring",
    silent: !process.env.CI,
    telemetry: false,
    widenClientFileUpload: true,
    sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN, deleteSourcemapsAfterUpload: true },
  });

export default function config(phase: string): NextConfig {
  return phase === PHASE_DEVELOPMENT_SERVER ? nextConfig : withSentry(nextConfig);
}
