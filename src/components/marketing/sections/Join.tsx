import { Section } from "@/components/ui/Section";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { joinSection as j } from "@/content/join";
import { StatusCards } from "../visuals/StatusCards";

export function Join() {
  return (
    <Section
      id={j.id}
      labelledBy={j.headingId}
      space="none"
      className="pt-[clamp(40px,6vw,72px)] pb-[clamp(64px,9vw,112px)]"
    >
      <div className="anim-panel grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(28px,4vw,56px)] rounded-[32px] border border-brand-mist bg-[linear-gradient(180deg,#EEF1FF_0%,#FFFFFF_100%)] px-[clamp(20px,5vw,64px)] py-[clamp(32px,6vw,72px)]">
        <div className="flex flex-col gap-4">
          <h2
            id={j.headingId}
            className="m-0 font-display text-[clamp(34px,4.6vw,56px)] leading-[1.05] font-bold tracking-[-0.04em]"
          >
            {j.titleStart} <span className="text-brand">{j.accent}</span> {j.titleEnd}
          </h2>
          <p className="m-0 text-[17px] leading-[1.6] text-muted">{j.body}</p>
          <WaitlistForm />
        </div>
        <StatusCards />
      </div>
    </Section>
  );
}
