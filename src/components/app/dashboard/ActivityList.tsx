"use client";

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

/** The history of every email action, newest first. Times are relative, in the viewer's clock. */
export function ActivityList({ items }: { items: ActivityItem[] }) {
  const now = useNow();
  return (
    <Panel id="activity-h" title={copy.title} delay={280}>
      {items.length === 0 ? (
        <p className="m-0 px-5 pt-3 pb-6 text-sm text-muted sm:px-6">{copy.empty}</p>
      ) : (
        <ol className="m-0 mt-3 flex list-none flex-col p-0 px-5 pb-5 sm:px-6">
          {items.map((item, i) => (
            <li key={item.id} className="relative flex gap-3 pb-3.5 last:pb-0">
              {i < items.length - 1 ? (
                <span aria-hidden="true" className="absolute top-3 bottom-0 left-[4px] w-px bg-line" />
              ) : null}
              <span
                aria-hidden="true"
                className={cn("relative mt-1.5 size-2.5 shrink-0 rounded-full", dot[item.action])}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm leading-snug break-words text-body">
                  {copy.describe(item.action, item.subject, item.recipient)}
                </p>
                <p className="m-0 mt-0.5 text-xs text-muted">
                  <time dateTime={item.at}>{now === null ? null : timeAgo(item.at, now)}</time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
