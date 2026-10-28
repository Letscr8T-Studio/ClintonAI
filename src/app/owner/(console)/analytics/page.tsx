import type { Metadata } from "next";
import { buildInsights } from "@/components/owner/analytics/insights";
import { SourcesTable } from "@/components/owner/analytics/SourcesTable";
import { BarChart } from "@/components/owner/BarChart";
import { PageHeader, SectionTitle } from "@/components/owner/Headings";
import { card } from "@/components/owner/styles";
import { requireAdmin } from "@/server/auth/guard";
import { buildAnalytics } from "@/server/waitlist/analytics";
import { listAllSignups } from "@/server/waitlist/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireAdmin();
  const a = buildAnalytics(await listAllSignups(), 30);

  return (
    <>
      <PageHeader eyebrow="Where and when people join" title="Analytics" />

      <section aria-label="Highlights" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {buildInsights(a).map((i) => (
          <div key={i.label} className={`${card} p-4 sm:p-5`}>
            <p className="text-xs font-medium text-muted">{i.label}</p>
            <p className="mt-1 truncate font-display text-2xl font-bold tracking-tight">{i.value}</p>
            <p className="mt-1 truncate text-xs text-subtle">{i.sub}</p>
          </div>
        ))}
      </section>

      <SourcesTable a={a} />

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={`${card} p-5`}>
          <SectionTitle title="By day of week" sub="All-time signups, Lagos time" />
          <BarChart
            height={180}
            data={a.weekdays.map((d) => ({ key: d.label, label: d.label, short: d.label, count: d.count }))}
          />
        </div>
        <div className={`${card} p-5`}>
          <SectionTitle title="By hour of day" sub="All-time signups, Lagos time" />
          <BarChart
            height={180}
            labelEvery={6}
            data={a.hours.map((h) => ({
              key: h.label,
              label: h.label,
              short: h.label.slice(0, 2),
              count: h.count,
            }))}
          />
        </div>
      </section>
    </>
  );
}
