import "server-only";
import type { EmailRow } from "@/types/database";
import { sendRawMessage } from "@/server/google/gmail";
import { buildPlainEmail } from "@/server/google/mime";
import { buildCard } from "./card";
import { deleteUnsent, withdrawRecipients } from "./repository";
import { prepareSafeSend } from "./service";

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

type Sender = { email: string; name: string | null };

export type SafeSendDelivery = { providerMessageId: string; notDelivered: string[] };

/**
 * Sends each person their own card with their own private link, from the user's Gmail. If the
 * first copy fails, nothing has gone out: everything is undone and the error goes back for the
 * normal retry rules. If a later copy fails, that person's link is withdrawn and they're listed.
 */
export async function sendSafeSendCopies(
  email: EmailRow,
  body: string,
  from: Sender,
  accessToken: string,
): Promise<SafeSendDelivery> {
  const prepared = await prepareSafeSend(email, body);
  // Everyone may see who else it went to (To and Cc), as with a normal email. Never Bcc.
  const visible = [...strings(email.to_recipients), ...strings(email.cc_recipients)].map((a) =>
    a.toLowerCase(),
  );
  const notDelivered: string[] = [];
  let providerMessageId: string | null = null;

  for (const link of prepared.links) {
    const card = buildCard({
      senderName: from.name || from.email,
      subject: email.subject,
      link: link.url,
      others: visible.filter((a) => a !== link.email),
    });
    try {
      const raw = buildPlainEmail({
        from,
        to: [link.email],
        subject: email.subject,
        body: card.text,
        html: card.html,
      });
      providerMessageId = (await sendRawMessage(accessToken, raw)) ?? providerMessageId;
    } catch (error) {
      if (providerMessageId === null) {
        await deleteUnsent(prepared.messageId);
        throw error;
      }
      notDelivered.push(link.email);
    }
  }

  if (notDelivered.length) {
    await withdrawRecipients(email.user_id, prepared.messageId, { emails: notDelivered });
  }
  return { providerMessageId: providerMessageId!, notDelivered };
}
