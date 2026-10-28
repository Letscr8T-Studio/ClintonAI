import { Section } from "@/components/ui/Section";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { outreachSection as o } from "@/content/outreach";
import { OutreachQueue } from "../visuals/OutreachQueue";

export function Outreach() {
  return (
    <Section id={o.id} labelledBy={o.headingId} space="tight">
      <div className="anim-panel grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-[clamp(32px,5vw,64px)] overflow-hidden rounded-[clamp(28px,4vw,40px)] bg-[radial-gradient(circle_at_85%_20%,#2A3A8F_0%,#151A3A_45%,#11131A_100%)] px-[clamp(20px,5vw,64px)] py-[clamp(32px,6vw,72px)] text-white">
        <div className="flex flex-col gap-[clamp(20px,3vw,28px)]">
          <div className="flex flex-col gap-4">
            <StatusBadge status="soon" dark />
            <h2
              id={o.headingId}
              className="m-0 font-display text-[clamp(36px,5vw,64px)] leading-[0.98] font-extrabold tracking-[-0.045em]"
            >
              {o.title} <span className="text-brand-soft">{o.accent}</span>
            </h2>
            <p className="m-0 max-w-[460px] text-[17px] leading-[1.6] text-navy-text">{o.body}</p>
          </div>
          <ol className="m-0 grid list-none grid-cols-2 gap-2.5 p-0">
            {o.steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5"
              >
                <span aria-hidden="true" className="font-mono text-[12px] text-brand-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] font-semibold">{step.title}</span>
                <span className="text-[13px] text-navy-text">{step.detail}</span>
              </li>
            ))}
          </ol>
          <p className="m-0 text-[13px] text-navy-text">{o.compliance}</p>
        </div>
        <OutreachQueue />
      </div>
    </Section>
  );
}
