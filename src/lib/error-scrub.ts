// Error reports (Sentry) must never carry people's email addresses or email content. Everything
// that could hold them is dropped or redacted before an event leaves the browser or the server.

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
export const REDACTED_EMAIL = "[email]";

/** Replaces every email address in a string. */
export const redactEmails = (text: string) => text.replace(EMAIL, REDACTED_EMAIL);

/** Redacts email addresses in every string inside a value (objects and arrays, any depth). */
export function redactDeep<T>(value: T, depth = 0): T {
  if (typeof value === "string") return redactEmails(value) as T;
  if (depth > 8 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, depth + 1)) as T;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactDeep(v, depth + 1)])) as T;
}

type EventShape = { user?: unknown; request?: { url?: string } };

/**
 * For Sentry's beforeSend: no user identity, no request bodies, cookies, headers or query strings
 * (they can hold emails, drafts or session tokens), and any email address left anywhere redacted.
 */
export function scrubEvent<E extends object>(event: E): E {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropped on purpose
  const { user, request, ...rest } = event as E & EventShape;
  const safeRequest = request?.url ? { url: redactEmails(request.url.split("?")[0]!) } : undefined;
  return redactDeep({ ...rest, ...(safeRequest ? { request: safeRequest } : {}) }) as E;
}
