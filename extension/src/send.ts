import type { z } from "zod";
import { emailActionErrors } from "@/content/app/outbox";
import { queueRequestSchema } from "@/lib/validation/compose";

/** POST /api/emails, as Compose on the web sends it. */
export type QueueRequest = z.input<typeof queueRequestSchema>;

export type QueueReply =
  | { kind: "ok"; id: string; sendAt: string }
  | { kind: "signed-out" }
  /** In the site's own words: shown to the person as is. */
  | { kind: "error"; error: string };

type Answer = { ok: true; id: string; sendAt: string } | { ok: false; error: string };

const post = (fetchImpl: typeof fetch, url: string, body?: unknown) =>
  fetchImpl(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

/**
 * Puts the email in the person's Outbox with the site's session. It leaves from their own Gmail
 * when its Smart Delay ends or at the time they picked (trust rule 5). Validated here first.
 */
export async function queueEmail(
  base: string,
  request: QueueRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<QueueReply> {
  const parsed = queueRequestSchema.safeParse(request);
  if (!parsed.success)
    return { kind: "error", error: parsed.error.issues[0]?.message ?? emailActionErrors.failed };
  try {
    const res = await post(fetchImpl, `${base}/api/emails`, parsed.data);
    if (res.status === 401) return { kind: "signed-out" };
    const json = (await res.json()) as Answer;
    if (json.ok) return { kind: "ok", id: json.id, sendAt: json.sendAt };
    return { kind: "error", error: json.error || emailActionErrors.failed };
  } catch {
    return { kind: "error", error: emailActionErrors.failed };
  }
}

/**
 * Undo: takes the email back out of the Outbox while it's still waiting (the same "edit" action
 * as Undo on the web). False once it has left or was cancelled elsewhere.
 */
export async function takeBack(base: string, id: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  try {
    const res = await post(fetchImpl, `${base}/api/emails/${id}/edit`);
    return res.ok && ((await res.json()) as { ok: boolean }).ok;
  } catch {
    return false;
  }
}
