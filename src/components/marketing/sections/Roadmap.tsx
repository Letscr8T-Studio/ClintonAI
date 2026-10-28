import { Section, SectionHeading } from "@/components/ui/Section";
import { roadmapSection, roadmapStages } from "@/content/roadmap";
import { cn } from "@/lib/cn";

export function Roadmap() {
  const { id, headingId, ...heading } = roadmapSection;
  return (
    <Section id={id} labelledBy={headingId}>
      <SectionHeading id={headingId} {...heading} />
      <ol className="anim-stagger m-0 grid list-none [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4 p-0">
        {roadmapStages.map((stage) => {
          const now = Boolean(stage.current);
          return (
            <li
              key={stage.when}
              aria-current={now ? "step" : undefined}
              className={cn(
                "flex flex-col gap-4 rounded-[28px] border p-[clamp(20px,2.4vw,28px)]",
                now ? "border-brand bg-brand text-white" : "border-line bg-white",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="m-0 font-display text-[34px] font-extrabold tracking-[-0.04em]">
                  {stage.when}
                </h3>
                <span className={cn("text-[13px] font-semibold", now ? "text-on-brand" : "text-subtle")}>
                  {stage.label}
                </span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {stage.items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "flex items-start gap-2.5 border-t pt-2 text-[15px]",
                      now ? "border-white/20 text-white" : "border-line-soft text-body",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-2 size-1.5 shrink-0 rounded-full",
                        now ? "bg-white" : "bg-brand-soft",
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
