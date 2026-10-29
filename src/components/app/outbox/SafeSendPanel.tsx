"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { safeSendCopy as copy } from "@/content/app/safe-send";
import { cn } from "@/lib/cn";
import { formatTimeLeft } from "@/lib/time";
import type { SafeSendInfo } from "@/types/emails";
import { useNow } from "./useNow";

type Props = { info: SafeSendInfo; busy: boolean; onWithdraw: (recipientId?: string) => void };

const button =
  "inline-flex min-h-9 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-60";

/** A sent Safe Send email: time left, who opened it, and withdraw for one person or everyone. */
export function SafeSendPanel({ info, busy, onWithdraw }: Props) {
  const now = useNow();
  const [confirming, setConfirming] = useState(false);
  const left = now === null ? null : new Date(info.expiresAt).getTime() - now;
  const open = !info.withdrawnAt && !info.contentDeletedAt && (left === null || left > 0);
  const status = info.withdrawnAt ? copy.withdrawn : open ? null : copy.expired;

  return (
    <div className="mt-3 rounded-2xl border border-brand-mist bg-brand-wash p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Chip tone="brand" size="xs">
            {copy.label}
          </Chip>
          <span className="text-[13px] font-medium text-brand-deep">
            {status ?? (left === null ? "" : copy.timeLeft(formatTimeLeft(left)))}
          </span>
        </div>
        {open && !confirming ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(true)}
            className={cn(button, "bg-ink text-white hover:bg-brand-deep")}
          >
            {busy ? copy.withdrawing : copy.withdrawAll}
          </button>
        ) : null}
      </div>

      {confirming ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[13px] text-ink">{copy.withdrawAllConfirm}</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                onWithdraw();
              }}
              className={cn(button, "bg-danger text-white")}
            >
              {copy.withdrawYes}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={cn(button, "border border-line-strong text-body")}
            >
              {copy.withdrawNo}
            </button>
          </div>
        </div>
      ) : null}

      <ul className="m-0 mt-3 flex list-none flex-col divide-y divide-brand-mist p-0">
        {info.recipients.map((r) => {
          const withdrawn = Boolean(r.withdrawnAt || info.withdrawnAt);
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[13px]">
              <span className="min-w-0 truncate font-medium text-ink">{r.email}</span>
              <span className="flex items-center gap-2 text-muted">
                {withdrawn ? copy.withdrawn : r.openCount ? copy.opened(r.openCount) : copy.notOpened}
                {open && !withdrawn ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onWithdraw(r.id)}
                    aria-label={`${copy.withdrawOne} ${r.email}`}
                    className={cn(
                      button,
                      "min-h-8 border border-line-strong bg-white text-ink hover:border-danger hover:text-danger",
                    )}
                  >
                    {copy.withdrawOne}
                  </button>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="m-0 mt-2 text-xs text-muted">{copy.opensNote}</p>
    </div>
  );
}
