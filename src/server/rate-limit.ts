import "server-only";

// In-memory fixed-window limiter. Each serverless instance keeps its own counts and
// they reset on redeploy, which is enough to slow down casual abuse. Swap for a shared
// store (Upstash Redis or a Supabase table) before Phase 1 sends real email.

type Entry = { count: number; resetAt: number };

export type RateLimiter = {
  /** True when the key has used up its allowance for the current window. */
  isLimited: (key: string, now?: number) => boolean;
  /** Counts one attempt against the key. */
  hit: (key: string, now?: number) => void;
  reset: (key: string) => void;
};

export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }): RateLimiter {
  const entries = new Map<string, Entry>();

  function prune(now: number) {
    if (entries.size <= 1000) return;
    for (const [key, entry] of entries) if (entry.resetAt <= now) entries.delete(key);
  }

  return {
    isLimited(key, now = Date.now()) {
      const entry = entries.get(key);
      return Boolean(entry && entry.resetAt > now && entry.count >= max);
    },
    hit(key, now = Date.now()) {
      prune(now);
      const entry = entries.get(key);
      if (!entry || entry.resetAt <= now) entries.set(key, { count: 1, resetAt: now + windowMs });
      else entry.count += 1;
    },
    reset(key) {
      entries.delete(key);
    },
  };
}
