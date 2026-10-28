import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { feeling } from "@/content/feeling";

export function Feeling() {
  return (
    <Section labelledBy={feeling.headingId} className="py-[clamp(40px,7vw,80px)]" space="none">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(24px,4vw,56px)]">
        <div className="anim-reveal flex max-w-[380px] flex-col gap-3.5">
          <Chip size="md" className="self-start text-brand">
            {feeling.pill}
          </Chip>
          <h2
            id={feeling.headingId}
            className="m-0 font-display text-[clamp(30px,3.6vw,44px)] leading-[1.08] font-bold tracking-[-0.035em]"
          >
            {feeling.title} <span className="ink-static ink-scroll text-brand">{feeling.accent}</span>
          </h2>
          <p className="m-0 text-base leading-[1.6] text-muted">{feeling.body}</p>
        </div>

        <ul className="anim-focus m-0 grid list-none [grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-3 p-0">
          {feeling.moments.map((moment) => (
            <li
              key={moment.text}
              className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-[18px]"
            >
              <p className="m-0 font-display text-lg leading-[1.25] font-semibold tracking-[-0.015em]">
                {moment.text}
              </p>
              <p className="m-0 text-sm text-subtle">{moment.after}</p>
              <Chip tone={moment.fix === "aiCheck" ? "sand" : "tint"} dot className="anim-tag self-start">
                {feeling.fixLabels[moment.fix]}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
