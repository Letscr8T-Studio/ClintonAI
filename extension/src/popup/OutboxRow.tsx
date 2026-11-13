import { useState } from "react";
import { outboxCopy } from "@/content/app/outbox";
import { safeSendCopy } from "@/content/app/safe-send";
import { popupOutboxCopy as copy } from "@/content/extension";
import { formatWhen } from "@/lib/schedule";
import { formatCountdown, formatTimeLeft } from "@/lib/time";
import type { PopupEmail } from "@/lib/validation/extension";
import type { OutboxAction } from "../outbox";

type Props = { email: PopupEmail; now: number; busy: boolean; onAct: (action: OutboxAction) => void };

const small =
  "cursor-pointer rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-wait disabled:opacity-60";
const quiet = `${small} border border-line-strong bg-surface text-ink hover:bg-paper`;
const strong = `${small} border-0 bg-night text-white hover:bg-brand-deep`;

function timeLine(email: PopupEmail, now: number): string {
  const left = Date.parse(email.until) - now;
  if (email.kind === "withdrawable") return safeSendCopy.timeLeft(formatTimeLeft(left));
  if (left <= 0) return copy.leaving;
  if (email.scheduled) return outboxCopy.scheduledFor(formatWhen(new Date(email.until)));
  return copy.leavesIn(formatCountdown(left / 1000));
}

/** One email in the popup: what it is, when it goes (or until when it can come back), and its actions. */
export function OutboxRow({ email, now, busy, onAct }: Props) {
  const [confirming, setConfirming] = useState(false);
  const waiting = email.kind === "waiting";
  const destructive: OutboxAction | null = waiting
    ? { type: "cancel", id: email.id }
    : email.safeSendMessageId
      ? { type: "withdraw", messageId: email.safeSendMessageId }
      : null;

  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-line bg-paper p-3">
      <p className="m-0 truncate text-[13px] font-semibold text-ink">
        {email.subject || outboxCopy.noSubject}
      </p>
      <p className="m-0 truncate text-xs text-muted">{outboxCopy.to(email.to.join(", "))}</p>
      <p className="m-0 text-xs font-medium text-brand-deep tabular-nums">{timeLine(email, now)}</p>
      {confirming && destructive ? (
        <div className="mt-1 flex flex-col gap-2">
          <p className="m-0 text-xs text-body">
            {waiting ? outboxCopy.cancelConfirm : safeSendCopy.withdrawAllConfirm}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} className={strong} onClick={() => onAct(destructive)}>
              {waiting ? outboxCopy.cancelYes : safeSendCopy.withdrawYes}
            </button>
            <button type="button" className={quiet} onClick={() => setConfirming(false)}>
              {waiting ? outboxCopy.cancelNo : safeSendCopy.withdrawNo}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex gap-2">
          {waiting ? (
            <button
              type="button"
              disabled={busy}
              className={strong}
              onClick={() => onAct({ type: "send-now", id: email.id })}
            >
              {outboxCopy.sendNow}
            </button>
          ) : null}
          {destructive ? (
            <button type="button" disabled={busy} className={quiet} onClick={() => setConfirming(true)}>
              {waiting ? outboxCopy.cancel : safeSendCopy.withdrawAll}
            </button>
          ) : null}
        </div>
      )}
    </li>
  );
}
