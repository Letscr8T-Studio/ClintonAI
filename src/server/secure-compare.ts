import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison of two secrets; hashing first makes the lengths equal. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
