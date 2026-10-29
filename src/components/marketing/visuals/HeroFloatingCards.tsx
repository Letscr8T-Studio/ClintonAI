import { Chip } from "@/components/ui/Chip";
import { ClintonMark } from "@/components/ui/icons";
import { heroCards } from "@/content/hero";

const card =
  "absolute hidden flex-col rounded-[20px] border border-card-line bg-white p-[18px] shadow-float min-[1100px]:flex";

/** Two decorative cards that drift as the page scrolls (wide screens only). */
export function HeroFloatingCards() {
  const { unsend, aiCheck } = heroCards;
  return (
    <>
      <div
        aria-hidden="true"
        className={`anim-float-l ${card} top-[58%] left-5 w-60 gap-3`}
        style={{ transform: "rotate(-6deg)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">{unsend.title}</span>
          <Chip tone="tint" size="xs">
            {unsend.status}
          </Chip>
        </div>
        <p className="m-0 font-mono text-[26px] font-medium tracking-[-0.03em]">{unsend.time}</p>
        <div className="h-1.5 rounded-full bg-brand-tint">
          <div className="h-full rounded-full bg-brand" style={{ width: `${unsend.progress}%` }} />
        </div>
        <span className="text-xs text-subtle">{unsend.caption}</span>
      </div>

      <div
        aria-hidden="true"
        className={`anim-float-r ${card} top-[54%] right-5 w-[250px] gap-2.5`}
        style={{ transform: "rotate(5deg)" }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-[26px] items-center justify-center rounded-lg bg-ink">
            <ClintonMark size={13} />
          </span>
          <span className="text-[13px] font-semibold">{aiCheck.title}</span>
        </div>
        <p className="m-0 text-sm leading-[1.45] text-body">
          {aiCheck.before} <span className="rounded-[3px] bg-highlight px-[3px]">{aiCheck.highlight}</span>
          {aiCheck.after}
        </p>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-ink px-3 py-[5px] text-xs font-semibold text-white">
            {aiCheck.fix}
          </span>
          <span className="rounded-full border border-line-strong px-3 py-[5px] text-xs text-muted">
            {aiCheck.ignore}
          </span>
        </div>
      </div>
    </>
  );
}
