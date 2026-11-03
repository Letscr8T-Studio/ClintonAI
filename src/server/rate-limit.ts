import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/server/supabase";

// Fixed-window rate limits, shared by every server instance through the database
// (rate_limit_take(): one atomic upsert per attempt). Keys are hashed with the limiter's name, so
// no IP address or email is stored. RATE_LIMIT_STORE=memory keeps counts in this process instead
// (unit tests).

/** Counts one attempt in the current window and returns the total so far. */
export type RateLimitStore = (bucket: string, windowMs: number) => Promise<number>;

export type RateLimiter = {
  /** Counts one attempt for `key`. True when it is over the allowance: refuse the request. */
  take: (key: string) => Promise<boolean>;
};

export function memoryStore(now: () => number = Date.now): RateLimitStore {
  const counts = new Map<string, number>();
  return async (bucket, windowMs) => {
    const id = `${bucket}:${Math.floor(now() / windowMs)}`;
    if (counts.size > 5000) counts.clear();
    const hits = (counts.get(id) ?? 0) + 1;
    counts.set(id, hits);
    return hits;
  };
}

export const databaseStore: RateLimitStore = async (bucket, windowMs) => {
  const { data, error } = await getSupabaseAdmin().rpc("rate_limit_take", {
    p_bucket: bucket,
    p_window_seconds: Math.ceil(windowMs / 1000),
  });
  if (error) throw new Error(error.message);
  return data;
};

const shared = process.env.RATE_LIMIT_STORE === "memory" ? memoryStore() : databaseStore;

export function createRateLimiter({
  name,
  max,
  windowMs,
  store = shared,
}: {
  /** Separates limiters that see the same keys ("check", "emails"…). */
  name: string;
  max: number;
  windowMs: number;
  store?: RateLimitStore;
}): RateLimiter {
  return {
    async take(key) {
      const bucket = createHash("sha256").update(`${name}:${key}`).digest("hex");
      try {
        return (await store(bucket, windowMs)) > max;
      } catch (error) {
        // Fail open: a database hiccup must not lock everyone out. Logged so it gets noticed.
        console.error("Rate limit unavailable", error instanceof Error ? error.message : error);
        return false;
      }
    },
  };
}
