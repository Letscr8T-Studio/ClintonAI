import { CheckList } from "@/components/ui/CheckList";
import { Section } from "@/components/ui/Section";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { dashboardSection as d } from "@/content/dashboard";
import { DashboardMock } from "../visuals/DashboardMock";

export function Dashboard() {
  return (
    <Section id={d.id} labelledBy={d.headingId}>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-[clamp(28px,5vw,64px)]">
        <div className="anim-reveal flex flex-col gap-4">
          <StatusBadge status="live" />
          <h2
            id={d.headingId}
            className="m-0 font-display text-[clamp(32px,4.4vw,54px)] leading-[1.05] font-bold tracking-[-0.04em]"
          >
            {d.title} <span className="text-brand">{d.accent}</span>
          </h2>
          <p className="m-0 max-w-[460px] text-[17px] leading-[1.6] text-muted">{d.body}</p>
          <CheckList items={d.points} />
          <p className="m-0 max-w-[460px] text-[13px] leading-[1.6] text-subtle">{d.footnote}</p>
        </div>
        <DashboardMock />
      </div>
    </Section>
  );
}
