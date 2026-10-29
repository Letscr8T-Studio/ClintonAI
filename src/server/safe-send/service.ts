import "server-only";
import { randomUUID } from "node:crypto";
import type { EmailRow } from "@/types/database";
import type { OutboxEmail } from "@/types/emails";
import type { SafeSendViewModel } from "@/types/safe-send";
import { recordActivity } from "@/server/emails/repository";
import { getAppUrl } from "@/server/env";
import { hashToken, isLinkToken, newDataKey, newLinkToken, openContent, sealContent } from "./keys";
import * as repo from "./repository";
import { downloadContent, removeContent, uploadContent } from "./storage";

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export type PreparedSafeSend = { messageId: string; links: { email: string; url: string }[] };

/** Encrypts the body with a fresh key, stores it privately, and creates one link per person. */
export async function prepareSafeSend(email: EmailRow, body: string): Promise<PreparedSafeSend> {
  const people = [
    ...new Set(
      [email.to_recipients, email.cc_recipients, email.bcc_recipients]
        .flatMap(strings)
        .map((a) => a.toLowerCase()),
    ),
  ];
  const links = people.map((address) => ({ address, ...newLinkToken() }));
  const dataKey = newDataKey();
  const storagePath = `${email.user_id}/${randomUUID()}.bin`;

  await uploadContent(storagePath, sealContent(body, dataKey));
  try {
    const { messageId } = await repo.createSafeSend({
      emailId: email.id,
      userId: email.user_id,
      storagePath,
      dataKey,
      recipients: links.map((l) => ({ email: l.address, tokenHash: l.hash })),
    });
    const base = getAppUrl();
    return { messageId, links: links.map((l) => ({ email: l.address, url: `${base}/m/${l.token}` })) };
  } catch (error) {
    await removeContent([storagePath]);
    throw error;
  }
}

export type SafeSendView = SafeSendViewModel;

/** What a recipient's link shows. Counts the open while the message is readable. */
export async function viewByToken(token: string): Promise<SafeSendView> {
  if (!isLinkToken(token)) return { kind: "not_found" };
  const row = await repo.openByTokenHash(hashToken(token));
  if (!row) return { kind: "not_found" };
  const senderName = row.sender_name || row.sender_email;
  if (row.withdrawn_at) return { kind: "withdrawn", senderName, withdrawnAt: row.withdrawn_at };
  if (row.content_deleted_at || new Date(row.expires_at) <= new Date())
    return { kind: "expired", senderName };

  const [dataKey, sealed] = await Promise.all([
    repo.getDataKey(row.message_id),
    downloadContent(row.storage_path),
  ]);
  if (!dataKey || !sealed) return { kind: "unreadable" };
  try {
    return {
      kind: "readable",
      senderName,
      senderEmail: row.sender_email,
      recipientEmail: row.recipient_email,
      subject: row.subject,
      sentAt: row.sent_at,
      expiresAt: row.expires_at,
      body: openContent(sealed, dataKey),
    };
  } catch {
    return { kind: "unreadable" };
  }
}

/** Withdraw for everyone (content shredded at once) or for one person. False if too late. */
export async function withdraw(userId: string, messageId: string, recipientId?: string): Promise<boolean> {
  if (recipientId) {
    const [address] = await repo.withdrawRecipients(userId, messageId, { ids: [recipientId] });
    if (!address) return false;
    const emailId = await repo.messageEmailId(userId, messageId);
    if (emailId) await recordActivity([{ userId, emailId, action: "withdrawn", recipient: address }]);
    return true;
  }
  const withdrawn = await repo.withdrawMessage(userId, messageId);
  if (!withdrawn) return false;
  const shredded = await repo.shred(messageId);
  await removeContent(shredded.map((s) => s.storage_path));
  await recordActivity([{ userId, emailId: withdrawn.emailId, action: "withdrawn" }]);
  return true;
}

/** The 24-hour window closed: destroy keys and files. Run by the dispatcher every 20 s. */
export async function expireDue(): Promise<number> {
  const shredded = await repo.shred();
  await removeContent(shredded.map((s) => s.storage_path));
  await recordActivity(
    shredded.map((s) => ({ userId: s.user_id, emailId: s.email_id, action: "expired" as const })),
  );
  return shredded.length;
}

/** Adds each sent Safe Send email's status (time left, opens, withdrawals) for the Outbox. */
export async function attachSafeSend(emails: OutboxEmail[]): Promise<OutboxEmail[]> {
  const ids = emails.filter((e) => e.safeSend && e.status === "sent").map((e) => e.id);
  const info = await repo.listForEmails(ids);
  return emails.map((e) => (info.has(e.id) ? { ...e, safeSendInfo: info.get(e.id) } : e));
}
