import { Section, SectionHeading } from "@/components/ui/Section";
import { howItWorksSection, steps } from "@/content/how-it-works";
import { stepVisuals } from "../visuals/StepVisuals";

export function HowItWorks() {
  const { id, headingId, ...heading } = howItWorksSection;
  return (
    <Section id={id} labelledBy={headingId}>
      <SectionHeading id={headingId} {...heading} />
      <ol className="anim-stagger m-0 grid list-none [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[18px] p-0">
        {steps.map((step) => {
          const Visual = stepVisuals[step.visual];
          return (
            <li
              key={step.num}
              className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-[26px]"
            >
              <div aria-hidden="true">
                <Visual />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[13px] text-brand">{step.num}</span>
                <h3 className="m-0 font-display text-[23px] font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-muted">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
