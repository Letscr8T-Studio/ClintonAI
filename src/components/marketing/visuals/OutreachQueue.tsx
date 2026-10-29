import { Chip } from "@/components/ui/Chip";
import { ClintonMark, Warning } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { outreachSample as s } from "@/content/outreach";

/** Review-queue card, merge-field warning and pipeline numbers for the outreach panel. */
export function OutreachQueue() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div
        className="anim-fan-a flex flex-col gap-3 rounded-[24px] bg-cream p-[clamp(16px,2.4vw,22px)] text-ink shadow-[0_34px_80px_rgba(0,0,0,0.45)]"
        style={{ transform: "rotate(-1.5deg)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[12px] text-brand">{s.queueLabel}</span>
          <Chip tone="tint" size="xs">
            <ClintonMark size={11} color={palette.brand} /> {s.badge}
          </Chip>
        </div>
        <div className="text-[13px] text-subtle">
          To <span className="font-semibold text-ink">{s.recipient}</span> · {s.role}
        </div>
        <p className="m-0 text-[14px] leading-[1.6] text-body">
          {s.greeting} <span className="rounded-[4px] bg-brand-tint px-1">{s.personalLine}</span> {s.rest}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white">
            {s.primaryAction}
          </span>
          {s.actions.map((action) => (
            <span key={action} className="rounded-full border border-line-strong px-3.5 py-1.5 text-[13px]">
              {action}
            </span>
          ))}
        </div>
      </div>
      <div
        className="anim-fan-b ml-[clamp(0px,5vw,48px)] flex items-center gap-3 rounded-[18px] border border-amber-line bg-amber-bg px-4 py-3.5"
        style={{ transform: "rotate(1.5deg)" }}
      >
        <Warning size={20} />
        <p className="m-0 text-[13px] leading-[1.4] text-amber-ink">{s.mergeWarning}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-[18px] bg-white/[0.06] p-2.5">
        {s.pipeline.map((stage) => (
          <div key={stage.label} className="rounded-xl bg-white/[0.06] px-2.5 py-2">
            <p className="m-0 font-display text-[20px] font-bold text-white">{stage.value}</p>
            <p className="m-0 text-[11px] text-navy-text">{stage.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
