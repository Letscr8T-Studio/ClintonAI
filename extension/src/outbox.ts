import { popupOutboxSchema, type PopupEmail } from "@/lib/validation/extension";

export type OutboxReply = { kind: "ok"; emails: PopupEmail[] } | { kind: "signed-out" } | { kind: "offline" };

/** The Outbox actions the popup offers, the same routes as the Outbox page. */
export type OutboxAction =
  { type: "cancel" | "send-now"; id: string } | { type: "withdraw"; messageId: string };

const ID = /^[0-9a-f-]{36}$/i;
const post = (fetchImpl: typeof fetch, url: string, body?: unknown) =>
  fetchImpl(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

/** What can still be cancelled, sent now or withdrawn, with the site's session. */
export async function fetchOutbox(base: string, fetchImpl: typeof fetch = fetch): Promise<OutboxReply> {
  try {
    const res = await fetchImpl(`${base}/api/outbox`, { credentials: "include", cache: "no-store" });
    if (res.status === 401) return { kind: "signed-out" };
    const parsed = popupOutboxSchema.safeParse(await res.json().catch(() => null));
    return res.ok && parsed.success ? { kind: "ok", emails: parsed.data.emails } : { kind: "offline" };
  } catch {
    return { kind: "offline" };
  }
}

/** Cancel, Send now, or withdraw a Safe Send for everyone. False if it has already moved on. */
export async function runOutboxAction(
  base: string,
  action: OutboxAction,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const id = action.type === "withdraw" ? action.messageId : action.id;
  if (!ID.test(id)) return false;
  const url =
    action.type === "withdraw"
      ? `${base}/api/safe-send/${id}/withdraw`
      : `${base}/api/emails/${id}/${action.type}`;
  try {
    const res = await post(fetchImpl, url, action.type === "withdraw" ? {} : undefined);
    return res.ok && Boolean(((await res.json()) as { ok?: boolean }).ok);
  } catch {
    return false;
  }
}
