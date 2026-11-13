import { findingLabels } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { checkRequestSchema, type CheckRequest } from "@/lib/validation/compose";

/** What the service worker answers to a check request. */
export type CheckReply =
  | { kind: "ok"; findings: Finding[]; modelUsed: boolean }
  | { kind: "signed-out" }
  /** Too many checks this minute; `error` says so in the site's words. */
  | { kind: "limited"; error: string }
  /** Offline, server trouble or a draft the check can't take: the page falls back to its rules. */
  | { kind: "failed" };

type CheckResponse = { ok: true; findings: Finding[]; modelUsed: boolean } | { ok: false; error: string };

/**
 * POST /api/check with the site's session, exactly as the web app's Compose does. The draft is
 * validated here first, so nothing malformed leaves the browser. The text is not stored (trust rule 6).
 */
export async function runCheck(
  base: string,
  draft: CheckRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<CheckReply> {
  const parsed = checkRequestSchema.safeParse(draft);
  if (!parsed.success) return { kind: "failed" };
  try {
    const res = await fetchImpl(`${base}/api/check`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.status === 401) return { kind: "signed-out" };
    const json = (await res.json()) as CheckResponse;
    if (res.status === 429 && !json.ok) return { kind: "limited", error: json.error };
    if (!res.ok || !json.ok || !Array.isArray(json.findings)) return { kind: "failed" };
    // Only kinds of finding this build can label; a newer server may know more.
    const findings = json.findings.filter(
      (f) => f && typeof f.message === "string" && f.type in findingLabels,
    );
    return { kind: "ok", findings, modelUsed: Boolean(json.modelUsed) };
  } catch {
    return { kind: "failed" };
  }
}
