import { useCallback, useState } from "react";
import { emailActionErrors } from "@/content/app/outbox";
import { composeBarCopy } from "@/content/extension";
import type { GmailDraft } from "../gmail/compose";
import { discardDraft, textToSend, type ReopenDraft } from "../gmail/sending";
import type { QueueReply, QueueRequest } from "../send";

/** What the person picked in the send section. */
export type SendChoices = { sendAt: Date | null; safeSend: boolean; trackOpens: boolean };

/** An email Clinton AI now holds, for the note after sending (and its Undo). */
export type Sent = {
  id: string;
  sendAt: string;
  scheduled: boolean;
  safeSend: boolean;
  /** Smart Delay off: it left straight away, so there's nothing to undo. */
  immediate: boolean;
  /** The email as written, to reopen in Gmail on Undo (signature left for Gmail to add). */
  reopen: ReopenDraft;
  /** False if Gmail's discard button wasn't found: the draft is still in Gmail. */
  discarded: boolean;
};

type CheckCounts = { checkIds: string[]; caught: number; fixed: number };

/**
 * Sends the compose window's email through Clinton AI: into the Outbox (validated in the service
 * worker), then Gmail's draft is discarded so the same email can't also go with Gmail's Send.
 */
export function useClintonSend(
  compose: Element,
  draft: GmailDraft,
  counts: CheckCounts,
  delaySeconds: number,
  queue: (request: QueueRequest) => Promise<QueueReply>,
  onSent: (sent: Sent) => void,
) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async ({ sendAt, safeSend, trackOpens }: SendChoices) => {
      setSending(true);
      setError(null);
      const { body, signature } = textToSend(compose);
      const { to, cc, bcc, subject } = draft;
      const request: QueueRequest = {
        to,
        cc,
        bcc,
        subject,
        body: signature ? `${body}\n\n${signature}` : body,
        attachments: [],
        sendAt: sendAt?.toISOString(),
        safeSend,
        trackOpens,
        findingsCount: counts.caught,
        findingsAccepted: Math.min(counts.fixed, counts.caught),
        checkIds: counts.checkIds,
      };
      const reply = await queue(request).catch((): QueueReply => ({
        kind: "error",
        error: emailActionErrors.failed,
      }));
      setSending(false);
      if (reply.kind === "signed-out") return setError(composeBarCopy.signIn);
      if (reply.kind === "error") return setError(reply.error);
      onSent({
        id: reply.id,
        sendAt: reply.sendAt,
        scheduled: Boolean(sendAt),
        safeSend,
        immediate: !sendAt && delaySeconds === 0,
        reopen: { to, cc, bcc, subject, body },
        discarded: discardDraft(compose),
      });
    },
    [compose, draft, counts, delaySeconds, queue, onSent],
  );

  return { sending, error, send };
}
