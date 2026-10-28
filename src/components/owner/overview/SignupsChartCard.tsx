import Link from "next/link";
import { cn } from "@/lib/cn";
import { longDay, shortDay } from "@/lib/time";
import { RANGES, type Analytics, type Range } from "@/types/waitlist";
import { BarChart } from "../BarChart";
import { Delta } from "../Indicators";
import { card } from "../styles";

const LABEL_EVERY: Record<Range, number> = { 7: 1, 30: 5, 90: 15 };

/** Signups per day with a 7 / 30 / 90 day switcher. */
export function SignupsChartCard({ a, range }: { a: Analytics; range: Range }) {
  const data = a.daily.map((d) => ({
    key: d.day,
    label: longDay(d.day),
    short: shortDay(d.day),
    count: d.count,
  }));

  return (
    <div className={`${card} p-5 lg:col-span-2`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">Signups</h2>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="font-semibold text-ink">{a.rangeTotal.toLocaleString()}</span> in the last{" "}
            {range} days
            <Delta cur={a.rangeTotal} prev={a.rangePrev} label="vs previous" />
          </p>
        </div>
        <nav
          aria-label="Chart range"
          className="inline-flex rounded-xl border border-line-strong bg-paper p-1 text-sm font-semibold"
        >
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/owner/dashboard?range=${r}`}
              scroll={false}
              aria-current={r === range ? "true" : undefined}
              className={cn(
                "rounded-lg px-3 py-1 transition",
                r === range ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {r}d<span className="sr-only"> range</span>
            </Link>
          ))}
        </nav>
      </div>
      <BarChart data={data} labelEvery={LABEL_EVERY[range]} />
    </div>
  );
}
