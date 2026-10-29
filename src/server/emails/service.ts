import "server-only";
import type { EmailDraft } from "@/types/emails";
import { listAccounts } from "@/server/accounts/repository";
import { decryptBody, encryptBody } from "./crypto";
import { deliver, type DeliveryOutcome } from "./deliver";
import * as repo from "./repository";

type User = { id: string };

export type QueueInput = {
  draft: EmailDraft;
  delaySeconds: number;
  findingsCount: number;
  findingsAccepted: number;
};

/** Puts an email in the Outbox: encrypted, held until now + its Smart Delay. */
export async function queueEmail(
  user: User,
  input: QueueInput,
  now = new Date(),
): Promise<{ id: string; sendAt: Date } | null> {
  const account = (await listAccounts()).find((a) => a.status === "active");
  if (!account) return null;

  const sendAt = new Date(now.getTime() + input.delaySeconds * 1000);
  const id = await repo.insertHeldEmail({
    userId: user.id,
    accountId: account.id,
    subject: input.draft.subject,
    to: input.draft.to,
    cc: input.draft.cc,
    bodyEncrypted: encryptBody(input.draft.body),
    sendAt,
    findingsCount: input.findingsCount,
    findingsAccepted: input.findingsAccepted,
  });
  await repo.recordActivity([{ userId: user.id, emailId: id, action: "held", recipient: input.draft.to[0] }]);
  return { id, sendAt };
}

export async function cancelEmail(user: User, id: string): Promise<boolean> {
  const [cancelled] = await repo.cancelHeld(user.id, { id });
  if (!cancelled) return false;
  await repo.recordActivity([{ userId: user.id, emailId: cancelled, action: "cancelled" }]);
  return true;
}

/**
 * Edit: the email comes back out of the Outbox into Compose. It is cancelled here (so it can never
 * leave mid-edit) and its text is returned once; sending again starts a new check and countdown.
 */
export async function takeBackForEdit(user: User, id: string): Promise<EmailDraft | null> {
  const email = await repo.findHeldEmail(user.id, id);
  if (!email?.body_encrypted) return null;
  const body = decryptBody(email.body_encrypted);
  const [cancelled] = await repo.cancelHeld(user.id, { id });
  if (!cancelled) return null; // it left in the meantime
  await repo.recordActivity([{ userId: user.id, emailId: id, action: "edited" }]);
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return { to: list(email.to_recipients), cc: list(email.cc_recipients), subject: email.subject, body };
}

/** Send now: skip the rest of the countdown for one of the user's own held emails. */
export async function sendNow(user: User, id: string): Promise<DeliveryOutcome | null> {
  const [email] = await repo.claimEmails({ emailId: id, userId: user.id, limit: 1 });
  return email ? deliver(email) : null;
}

/** The dispatcher: send everything that is due. Called by pg_cron every 20 seconds. */
export async function dispatchDue(limit = 20): Promise<Record<DeliveryOutcome, number>> {
  const counts: Record<DeliveryOutcome, number> = { sent: 0, retry: 0, failed: 0 };
  const due = await repo.claimEmails({ limit });
  // A few at a time: fast enough, and gentle on Gmail's per-user rate limits.
  for (let i = 0; i < due.length; i += 5) {
    const batch = await Promise.allSettled(due.slice(i, i + 5).map((email) => deliver(email)));
    for (const result of batch) {
      if (result.status === "fulfilled") counts[result.value] += 1;
      else
        console.error("Delivery crashed", result.reason instanceof Error ? result.reason.message : "unknown");
    }
  }
  return counts;
}

/** Before Gmail is disconnected: nothing waiting may leave from it afterwards. */
export async function cancelHeldForAccount(user: User, accountId: string): Promise<void> {
  const ids = await repo.cancelHeld(user.id, { accountId });
  await repo.recordActivity(
    ids.map((emailId) => ({ userId: user.id, emailId, action: "cancelled" as const })),
  );
}
