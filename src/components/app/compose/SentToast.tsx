"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { clockTime, useNow } from "@/components/app/outbox/useNow";
import { Check, Close } from "@/components/ui/icons";
import { appRoutes } from "@/config/routes";
import { sentToastCopy as copy } from "@/content/app/compose";
import { formatClock } from "@/lib/time";
import type { SentEmail } from "./useSendEmail";

type Props = {
  email: SentEmail;
  onUndo: () => void;
  undoing: boolean;
  error: string | null;
  onDismiss: () => void;
};

const button =
  "inline-flex min-h-10 cursor-pointer items-center rounded-full px-3.5 text-sm font-semibold no-underline transition-colors";

/**
 * After Send: "Sending in 4:59 · Undo · View", like Gmail's, but Undo lasts the whole Smart Delay,
 * not seconds. Focus moves here, so keyboard users are one Tab from Undo. The ticking clock is
 * hidden from screen readers; they hear the leave time once.
 */
export function SentToast({ email, onUndo, undoing, error, onDismiss }: Props) {
  const now = useNow();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => box.current?.focus(), [email.id]);

  const left = now === null ? null : Math.max(0, Math.ceil((Date.parse(email.sendAt) - now) / 1000));
  const gone = email.immediate || left === 0;

  return (
    <div
      ref={box}
      tabIndex={-1}
      role="region"
      aria-label={copy.label}
      onKeyDown={(e) => e.key === "Escape" && onDismiss()}
      className="cl-rise fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-40 mx-auto flex max-w-[560px] flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-night py-2 pr-2 pl-4 text-white shadow-pop outline-none sm:bottom-6"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-6 items-center justify-center rounded-full bg-brand"
      >
        <Check size={12} />
      </span>
      <p role="status" className="m-0 min-w-0 flex-1 text-sm">
        {gone ? (
          <>
            <span className="font-semibold">{copy.sent}</span>
            <span className="sr-only">. {copy.sentNote}</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">
              {copy.leavingIn}{" "}
              <span className="font-mono font-medium tabular-nums">
                {left === null ? "" : formatClock(left)}
              </span>
            </span>
            <span className="sr-only">{copy.leavesAt(clockTime(email.sendAt))}</span>
          </>
        )}
        {error ? <span className="block text-[13px] text-navy-text">{error}</span> : null}
      </p>
      {!gone ? (
        <button
          type="button"
          onClick={onUndo}
          disabled={undoing}
          aria-busy={undoing}
          className={`${button} text-brand-soft hover:bg-white/10 disabled:cursor-wait`}
        >
          {undoing ? copy.undoing : copy.undo}
        </button>
      ) : null}
      <Link
        href={appRoutes.outbox}
        aria-label={copy.viewLabel}
        className={`${button} text-white hover:bg-white/10`}
      >
        {copy.view}
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.dismiss}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-navy-text hover:bg-white/10 hover:text-white"
      >
        <Close size={16} />
      </button>
    </div>
  );
}
