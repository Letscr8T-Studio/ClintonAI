import type { Analytics } from "@/types/waitlist";
import { percent } from "../format";
import { Empty, SectionTitle } from "../Headings";
import { ProgressBar } from "../Indicators";
import { card } from "../styles";

export function SourcesTable({ a }: { a: Analytics }) {
  const max = Math.max(1, ...a.sources.map((s) => s.count));
  return (
    <section className={`${card} mt-4 p-5`}>
      <SectionTitle
        title="Sources"
        sub="Which channels bring people, and who follows through on the survey"
      />
      {a.sources.length === 0 ? (
        <Empty />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="py-2.5 pr-3 font-medium">
                  Source
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Signups
                </th>
                <th scope="col" className="w-1/3 px-3 py-2.5 font-medium">
                  Share
                </th>
                <th scope="col" className="py-2.5 pl-3 text-right font-medium">
                  Survey rate
                </th>
              </tr>
            </thead>
            <tbody>
              {a.sources.map((s) => (
                <tr key={s.source} className="border-b border-line last:border-0">
                  <th scope="row" className="max-w-[12rem] truncate py-3 pr-3 text-left font-semibold">
                    {s.source}
                  </th>
                  <td className="px-3 py-3 tabular-nums">{s.count}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar value={(s.count / max) * 100} size="sm" />
                      </div>
                      <span className="w-9 text-right text-xs text-muted tabular-nums">
                        {percent(s.count, a.total)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pl-3 text-right tabular-nums">{percent(s.surveyed, s.count)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
