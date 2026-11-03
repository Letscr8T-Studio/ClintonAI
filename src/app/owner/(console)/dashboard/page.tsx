import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/Headings";
import { KpiGrid } from "@/components/owner/overview/KpiGrid";
import { OverviewHero } from "@/components/owner/overview/OverviewHero";
import { SignupsChartCard } from "@/components/owner/overview/SignupsChartCard";
import { RecentSignups, TopSources } from "@/components/owner/overview/SourcesAndRecent";
import { SurveyFunnel } from "@/components/owner/overview/SurveyFunnel";
import { greeting } from "@/lib/time";
import { requireAdmin } from "@/server/auth/admin";
import { buildAnalytics, parseRange } from "@/server/waitlist/analytics";
import { listAllSignups } from "@/server/waitlist/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Overview" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OverviewPage({ searchParams }: Props) {
  const { email } = await requireAdmin("view dashboard");
  const range = parseRange((await searchParams).range);
  const a = buildAnalytics(await listAllSignups(), range);

  return (
    <>
      <PageHeader eyebrow={`${greeting()}, ${(email ?? "").split("@")[0]}`} title="Overview" />
      <OverviewHero a={a} />
      <KpiGrid a={a} />
      <section aria-label="Signups over time" className="mt-4 grid gap-4 lg:grid-cols-3">
        <SignupsChartCard a={a} range={range} />
        <SurveyFunnel a={a} />
      </section>
      <section aria-label="Sources and latest signups" className="mt-4 grid gap-4 lg:grid-cols-5">
        <TopSources a={a} />
        <RecentSignups a={a} />
      </section>
    </>
  );
}
