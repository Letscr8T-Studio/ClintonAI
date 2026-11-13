"use client";

import { useSyncExternalStore } from "react";
import { LockIcon } from "@/components/ui/app-icons";
import { LocalTime } from "@/components/ui/LocalTime";
import { viewCopy as copy } from "@/content/app/safe-send";

const MINUTE = 60_000;
const subscribe = (tick: () => void) => {
  const id = setInterval(tick, MINUTE);
  return () => clearInterval(id);
};
/** The current minute, in the browser only (the server can't know the reader's clock). */
const nowMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE;

type Props = { sender: string; sentAt: string | null; expiresAt: string };

/**
 * "Private to you · Ada can withdraw this until 18:05", with a thin bar of the time left. The
 * sentence carries the meaning; the bar is decoration.
 */
export function WindowStrip({ sender, sentAt, expiresAt }: Props) {
  const now = useSyncExternalStore(subscribe, nowMinute, () => null);
  const end = Date.parse(expiresAt);
  const start = sentAt ? Date.parse(sentAt) : end - 24 * 60 * MINUTE;
  const left = now === null ? 1 : Math.min(1, Math.max(0, (end - now) / (end - start)));

  return (
    <div className="flex flex-col gap-3 bg-brand-wash px-6 py-5 sm:px-12">
      <p className="m-0 flex items-start gap-2.5 text-[14px] leading-snug text-brand-deep">
        <LockIcon size={17} className="mt-px shrink-0" />
        <span>
          {copy.window(sender)} <LocalTime iso={expiresAt} />.
        </span>
      </p>
      <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-brand-mist">
        <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round(left * 100)}%` }} />
      </div>
    </div>
  );
}
