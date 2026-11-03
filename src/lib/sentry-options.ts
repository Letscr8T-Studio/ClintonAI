import type { BrowserOptions } from "@sentry/nextjs";
import { redactDeep, scrubEvent } from "./error-scrub";

/**
 * Sentry settings shared by the browser, server and edge. Off until NEXT_PUBLIC_SENTRY_DSN is set.
 * Never sends personal data: nothing is collected about users or requests (dataCollection), and
 * every event, transaction and breadcrumb is scrubbed of email addresses and request content first.
 */
export function sentryOptions(): BrowserOptions {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    // Sentry 11 collects all of these by default. None of them: they can hold people's email
    // addresses, email text (request bodies, AI prompts, local variables) or session cookies.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    tracesSampleRate: 0.1,
    beforeSend: (event) => scrubEvent(event),
    beforeSendTransaction: (event) => scrubEvent(event),
    beforeBreadcrumb: (crumb) => redactDeep(crumb),
  };
}
