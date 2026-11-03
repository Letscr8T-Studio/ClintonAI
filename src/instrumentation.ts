import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry-options";

// Server and edge error tracking (Sentry). Browser: src/instrumentation-client.ts.
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(sentryOptions());
  }
}

/** Errors thrown while rendering or in route handlers. */
export const onRequestError = Sentry.captureRequestError;
