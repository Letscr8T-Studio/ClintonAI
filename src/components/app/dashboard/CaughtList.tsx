import { Chip } from "@/components/ui/Chip";
import { LocalTime } from "@/components/ui/LocalTime";
import { findingLabels } from "@/content/app/compose";
import { caughtCopy as copy } from "@/content/app/dashboard";
import type { CaughtEmail } from "@/types/dashboard";
import { Panel } from "./Panel";

const label = (kind: string) => findingLabels[kind as keyof typeof findingLabels] ?? findingLabels.other;
/** Kinds shown as chips before "+N". */
const SHOWN = 2;

type Props = {
  items: CaughtEmail[];
  footer?: { href: string; label: string };
  className?: string;
};

/** Emails Clinton flagged before they left: the kinds of mistake, and what the user did. Compact rows. */
export function CaughtList({ items, footer, className }: Props) {
  return (
    <Panel id="caught-h" title={copy.title} footer={footer} delay={220} className={className}>
      {items.length === 0 ? (
        <p className="m-0 px-5 pt-3 pb-6 text-sm leading-relaxed text-muted sm:px-6">{copy.empty}</p>
      ) : (
        <ul className="m-0 mt-3 flex list-none flex-col p-0">
          {items.map((item) => {
            const kinds = [...new Set(item.kinds.map(label))];
            return (
              <li key={item.id} className="border-t border-line px-5 py-3 sm:px-6">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="m-0 truncate text-[14px] font-semibold text-ink">
                    {item.subject || copy.noSubject}
                  </p>
                  <span className="shrink-0 text-xs text-muted">
                    <LocalTime iso={item.createdAt} />
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {kinds.length ? (
                    <ul aria-label={copy.kindsLabel} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                      {kinds.slice(0, SHOWN).map((k) => (
                        <li key={k}>
                          <Chip size="xs" tone="amber">
                            {k}
                          </Chip>
                        </li>
                      ))}
                      {kinds.length > SHOWN ? (
                        <li>
                          <Chip size="xs" tone="neutral">{`+${kinds.length - SHOWN}`}</Chip>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                  <span className="ml-auto text-[12.5px] text-muted">
                    <span className={item.fixed ? "font-semibold text-brand-ink" : undefined}>
                      {copy.outcome(item.fixed, item.caught)}
                    </span>
                    {" · "}
                    {copy.status[item.status]}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
