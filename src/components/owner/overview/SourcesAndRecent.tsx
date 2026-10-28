import type { Analytics } from "@/types/waitlist";
import { percent } from "../format";
import { Empty, SectionTitle } from "../Headings";
import { ProgressBar } from "../Indicators";
import { SignupRow } from "../SignupRow";
import { card } from "../styles";

export function TopSources({ a }: { a: Analytics }) {
  const top = a.sources.slice(0, 5);
  const max = Math.max(1, ...top.map((s) => s.count));
  return (
    <div className={`${card} p-5 lg:col-span-2`}>
      <SectionTitle title="Top sources" href="/owner/analytics" />
      {top.length === 0 ? (
        <Empty />
      ) : (
        <ul className="space-y-4">
          {top.map((s) => (
            <li key={s.source}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">{s.source}</span>
                <span className="text-muted tabular-nums">
                  {s.count} · {percent(s.count, a.total)}%
                </span>
              </div>
              <ProgressBar value={(s.count / max) * 100} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RecentSignups({ a }: { a: Analytics }) {
  return (
    <div className={`${card} p-5 lg:col-span-3`}>
      <SectionTitle title="Latest signups" href="/owner/signups" />
      {a.recent.length === 0 ? (
        <Empty />
      ) : (
        <ul className="divide-y divide-line">
          {a.recent.map((r) => (
            <SignupRow key={r.id} signup={r} className="py-2.5 first:pt-0 last:pb-0" />
          ))}
        </ul>
      )}
    </div>
  );
}
