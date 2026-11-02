import { Chip } from "@/components/ui/Chip";
import { LocalTime } from "@/components/ui/LocalTime";
import { findingLabels } from "@/content/app/compose";
import { caughtCopy as copy } from "@/content/app/dashboard";
import type { CaughtEmail } from "@/types/dashboard";
import { Panel } from "./Panel";

const label = (kind: string) => findingLabels[kind as keyof typeof findingLabels] ?? findingLabels.other;

/** Emails Clinton flagged before they left: the kinds of mistake, and what the user did. */
export function CaughtList({ items }: { items: CaughtEmail[] }) {
  return (
    <Panel id="caught-h" title={copy.title} delay={220}>
      {items.length === 0 ? (
        <p className="m-0 px-5 pt-3 pb-6 text-sm leading-relaxed text-muted sm:px-6">{copy.empty}</p>
      ) : (
        <ul className="m-0 mt-3 flex list-none flex-col p-0 pb-2">
          {items.map((item) => (
            <li key={item.id} className="border-t border-line px-5 py-3.5 sm:px-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="m-0 truncate font-semibold text-ink">{item.subject || copy.noSubject}</p>
                <span className="shrink-0 text-xs text-muted">
                  <LocalTime iso={item.createdAt} />
                </span>
              </div>
              {item.kinds.length ? (
                <ul aria-label={copy.kindsLabel} className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
                  {[...new Set(item.kinds.map(label))].map((k) => (
                    <li key={k}>
                      <Chip size="xs" tone="amber">
                        {k}
                      </Chip>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="m-0 mt-2 text-[13px] text-muted">
                <span className={item.fixed ? "font-semibold text-brand-ink" : undefined}>
                  {copy.outcome(item.fixed, item.caught)}
                </span>
                {" · "}
                {copy.status[item.status]}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
