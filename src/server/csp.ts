import "server-only";

// Content-Security-Policy, built per request in the proxy. Scripts run only with this request's
// nonce ('strict-dynamic' lets Next.js's own trusted scripts load their chunks), so injected
// scripts can't run. Everything else is limited to what we actually use.

const TALLY = "https://tally.so";
const GOOGLE_SIGN_IN = "https://accounts.google.com";

type Options = {
  nonce: string;
  /** The Supabase project: attachment uploads and the sign-in redirect go there. */
  supabaseUrl?: string;
  /** Dev only: React Refresh needs eval, and Next's dev server a websocket. */
  dev?: boolean;
};

export function buildCsp({ nonce, supabaseUrl, dev = false }: Options): string {
  const supabase = supabaseUrl ? [new URL(supabaseUrl).origin] : [];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      TALLY,
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    // React style attributes (and the Tally popup) need inline styles; styles can't run code.
    "style-src": ["'self'", "'unsafe-inline'", TALLY],
    "img-src": ["'self'", "data:", "blob:", TALLY],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...supabase, TALLY, ...(dev ? ["ws:"] : [])],
    "frame-src": [TALLY],
    "frame-ancestors": ["'none'"],
    // Sign-in posts to our server, which redirects on to Supabase and Google.
    "form-action": ["'self'", ...supabase, GOOGLE_SIGN_IN],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "worker-src": ["'self'", "blob:"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!dev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

/** 128 random bits, base64: a fresh nonce for every request. */
export function newNonce(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
}
