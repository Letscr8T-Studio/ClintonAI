import type { ReactNode } from "react";
import type { Analytics } from "@/types/waitlist";
import { Delta } from "../Indicators";
import { Ring, Sparkline } from "../Sparks";
import { card } from "../styles";

function Kpi({ label, value, children }: { label: string; value: ReactNode; children: ReactNode }) {
  return (
    <div className={`${card} p-4 sm:p-5`}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function KpiGrid({ a }: { a: Analytics }) {
  return (
    <section aria-label="Key numbers" className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi label="Today" value={a.today}>
        <Delta cur={a.today} prev={a.yesterday} label="vs yesterday" />
      </Kpi>
      <Kpi label="Last 7 days" value={a.last7}>
        <Delta cur={a.last7} prev={a.prev7} label="vs prior week" />
      </Kpi>
      <Kpi label="Avg per day" value={a.avgPerDay}>
        <Sparkline values={a.spark} className="h-6 w-full text-brand" />
      </Kpi>
      <div className={`${card} flex items-center justify-between gap-2 p-4 sm:p-5`}>
        <div>
          <p className="text-xs font-medium text-muted">Survey rate</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight tabular-nums">{a.surveyRate}%</p>
          <p className="mt-2 text-xs text-subtle">
            {a.surveyed} of {a.total}
          </p>
        </div>
        <div className="relative shrink-0">
          <Ring pct={a.surveyRate} />
        </div>
      </div>
    </section>
  );
}
