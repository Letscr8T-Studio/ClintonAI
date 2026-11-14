import type { Metadata } from "next";
import Link from "next/link";
import { ActivityList } from "@/components/app/dashboard/ActivityList";
import { CaughtList } from "@/components/app/dashboard/CaughtList";
import { HistoryTabs } from "@/components/app/dashboard/HistoryTabs";
import { appRoutes } from "@/config/routes";
import { historyCopy as copy } from "@/content/app/dashboard";
import { listActivity, listCaught } from "@/server/dashboard/repository";

export const metadata: Metadata = { title: "History" };

type Props = { searchParams: Promise<{ view?: string }> };

/** Everything Clinton caught, or every email action, for the last 30 days: what Home only samples. */
export default async function HistoryPage({ searchParams }: Props) {
  const view = (await searchParams).view === "caught" ? "caught" : "all";
  const caught = view === "caught" ? await listCaught(100) : null;
  const activity = view === "all" ? await listActivity(200) : null;

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-6">
      <header>
        <Link
          href={appRoutes.home}
          className="text-sm font-semibold text-brand-ink no-underline hover:underline"
        >
          &larr; {copy.back}
        </Link>
        <h1 className="mt-3 mb-0 font-display text-[clamp(32px,4vw,44px)] font-bold tracking-[-0.04em]">
          {copy.title}
        </h1>
        <p className="mt-2 mb-0 max-w-[560px] text-muted">{copy.intro}</p>
      </header>
      <HistoryTabs current={view} />
      {caught ? <CaughtList items={caught} /> : null}
      {activity ? <ActivityList items={activity} grouped /> : null}
    </div>
  );
}
