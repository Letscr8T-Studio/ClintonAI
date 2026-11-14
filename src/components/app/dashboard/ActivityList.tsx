"use client";

import { Fragment } from "react";
import { useNow } from "@/components/app/outbox/useNow";
import { activityCopy as copy } from "@/content/app/dashboard";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/time";
import type { ActivityAction } from "@/types/database";
import type { ActivityItem } from "@/types/dashboard";
import { Panel } from "./Panel";

const dot: Record<ActivityAction, string> = {
  held: "bg-brand-mist",
  edited: "bg-brand-mist",
  sent: "bg-brand",
  opened: "bg-brand",
  cancelled: "bg-subtle",
  withdrawn: "bg-subtle",
  expired: "bg-subtle",
  failed: "bg-amber-dot",
};

const clock = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** "Today", "Yesterday" or "Mon 10 Nov", in the viewer's own calendar. */
function dayLabel(iso: string, now: number): string {
  const day = new Date(iso).toDateString();
  if (day === new Date(now).toDateString()) return copy.today;
  if (day === new Date(now - 86_400_000).toDateString()) return copy.yesterday;
  return new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(iso),
  );
}

type Props = {
  items: ActivityItem[];
  footer?: { href: string; label: string };
  /** The History page: day headings between the entries. */
  grouped?: boolean;
  className?: string;
};

/** The history of email actions, newest first, one line each. Times are in the viewer's clock. */
export function ActivityList({ items, footer, grouped = false, className }: Props) {
  const now = useNow();
  return (
    <Panel id="activity-h" title={copy.title} footer={footer} delay={280} className={className}>
      {items.length === 0 ? (
        <p className="m-0 px-5 pt-3 pb-6 text-sm text-muted sm:px-6">{copy.empty}</p>
      ) : (
        <ol className="m-0 mt-2 flex list-none flex-col p-0 px-5 pb-4 sm:px-6">
          {items.map((item, i) => {
            const day = grouped && now !== null ? dayLabel(item.at, now) : null;
            const newDay = day !== null && (i === 0 || dayLabel(items[i - 1].at, now!) !== day);
            return (
              <Fragment key={item.id}>
                {newDay ? (
                  <li className="pt-4 pb-1.5 font-mono text-[11px] tracking-wider text-muted uppercase first:pt-1">
                    {day}
                  </li>
                ) : null}
                <li className="flex items-start gap-3 py-2">
                  <span
                    aria-hidden="true"
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot[item.action])}
                  />
                  <p className="m-0 min-w-0 flex-1 text-[13.5px] leading-snug break-words text-body">
                    {copy.describe(item.action, item.subject, item.recipient)}
                  </p>
                  <time dateTime={item.at} className="shrink-0 pt-px text-xs text-muted">
                    {now === null ? null : grouped ? clock(item.at) : timeAgo(item.at, now)}
                  </time>
                </li>
              </Fragment>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
