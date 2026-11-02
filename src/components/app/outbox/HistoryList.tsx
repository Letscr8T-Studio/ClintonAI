"use client";

import { Chip } from "@/components/ui/Chip";
import { outboxCopy as copy } from "@/content/app/outbox";
import type { OutboxEmail } from "@/types/emails";
import { SafeSendPanel } from "./SafeSendPanel";
import { clockTime, useNow } from "./useNow";

const DAY = 86_400_000;

/** "14:37" today, otherwise "28 Oct, 14:37", in the viewer's time zone. */
function when(iso: string, now: number): string {
  const time = clockTime(iso);
  if (now - new Date(iso).getTime() < DAY && new Date(iso).getDate() === new Date(now).getDate()) return time;
  const day = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(iso));
  return `${day}, ${time}`;
}

type Props = {
  emails: OutboxEmail[];
  empty: string;
  busyId?: string | null;
  onWithdraw?: (email: OutboxEmail, recipientId?: string) => void;
};

/** Sent, cancelled and not-sent emails, newest first; Safe Send ones with their controls. */
export function HistoryList({ emails, empty, busyId = null, onWithdraw }: Props) {
  const now = useNow();
  if (emails.length === 0) return <p className="m-0 text-sm text-muted">{empty}</p>;
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-surface p-0">
      {emails.map((email) => (
        <li key={email.id} className="px-5 py-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate font-semibold text-ink">{email.subject || copy.noSubject}</p>
              <p className="m-0 mt-0.5 truncate text-sm text-muted">{copy.to(email.to.join(", "))}</p>
              {email.failureReason && email.status !== "cancelled" ? (
                <p
                  className={`m-0 mt-1.5 text-[13px] ${email.status === "failed" ? "text-danger-ink" : "text-amber-ink"}`}
                >
                  {email.failureReason}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm text-muted">
              {email.status === "sent" ? (
                <span>
                  {now !== null && email.sentAt ? copy.sentAt(when(email.sentAt, now)) : copy.inGmail}
                </span>
              ) : null}
              <Chip
                size="xs"
                tone={email.status === "sent" ? "tint" : email.status === "failed" ? "amber" : "neutral"}
              >
                {email.status === "sent"
                  ? copy.sentTitle
                  : email.status === "failed"
                    ? copy.failed
                    : copy.cancelled}
              </Chip>
            </div>
          </div>
          {email.safeSendInfo && onWithdraw ? (
            <SafeSendPanel
              info={email.safeSendInfo}
              busy={busyId === email.id}
              onWithdraw={(recipientId) => onWithdraw(email, recipientId)}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
