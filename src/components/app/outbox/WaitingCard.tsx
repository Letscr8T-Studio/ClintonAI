"use client";

import { useState } from "react";
import { ProgressRing } from "@/components/app/ProgressRing";
import { outboxCopy as copy } from "@/content/app/outbox";
import { formatClock } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { OutboxEmail } from "@/types/emails";
import { clockTime, useNow } from "./useNow";

export type OutboxAction = "edit" | "cancel" | "send-now";

type Props = { email: OutboxEmail; busy: boolean; onAction: (action: OutboxAction) => void };

const button =
  "inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60";

/** A waiting email: its countdown, who it's for, and Edit / Cancel / Send now. */
export function WaitingCard({ email, busy, onAction }: Props) {
  const now = useNow();
  const [confirming, setConfirming] = useState(false);
  const total = Math.max(1, new Date(email.sendAt).getTime() - new Date(email.createdAt).getTime());
  const left = now === null ? null : Math.max(0, new Date(email.sendAt).getTime() - now);
  const leaving = email.status === "sending" || left === 0;

  return (
    <li className="cl-rise relative flex flex-col gap-5 overflow-hidden rounded-[28px] bg-ink p-5 text-white sm:flex-row sm:items-center sm:p-6">
      <div aria-hidden="true" className="stage-grid absolute inset-0" />
      <ProgressRing
        value={left === null ? 1 : left / total}
        valueClassName="text-[20px]"
        sizeClassName="w-24"
        className="relative shrink-0"
      >
        {left === null ? "--:--" : formatClock(Math.ceil(left / 1000))}
      </ProgressRing>

      <div className="relative min-w-0 flex-1">
        <p className="m-0 font-mono text-[11px] tracking-wider text-navy-text uppercase" aria-live="polite">
          {leaving ? copy.leaving : now === null ? copy.leavingIn : copy.leavesAt(clockTime(email.sendAt))}
        </p>
        <h3 className="mt-1.5 mb-0 truncate font-display text-xl font-bold tracking-tight">
          {email.subject || copy.noSubject}
        </h3>
        <p className="m-0 mt-1 truncate text-sm text-navy-text">{copy.to(email.to.join(", "))}</p>
        {email.failureReason ? (
          <p className="mt-2 mb-0 text-[13px] text-amber">{email.failureReason}</p>
        ) : null}
      </div>

      {!leaving ? (
        <div className="relative flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
          {confirming ? (
            <div className="flex flex-col gap-2 rounded-2xl bg-white/10 p-3 sm:max-w-[220px]">
              <p className="m-0 text-[13px] text-on-brand">{copy.cancelConfirm}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onAction("cancel")}
                  className={cn(button, "bg-danger text-white")}
                >
                  {copy.cancelYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className={cn(button, "bg-white/10 text-white")}
                >
                  {copy.cancelNo}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("send-now")}
                className={cn(button, "bg-brand text-white hover:bg-brand-light")}
              >
                {busy ? copy.working : copy.sendNow}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("edit")}
                className={cn(button, "border border-navy-line text-white hover:bg-white/10")}
              >
                {copy.edit}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(true)}
                className={cn(button, "text-navy-text hover:text-white")}
              >
                {copy.cancel}
              </button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}
