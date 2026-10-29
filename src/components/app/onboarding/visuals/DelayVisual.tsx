import { Countdown } from "@/components/ui/Countdown";
import { delaySample as s } from "@/content/app/tour-visuals";
import { ProgressRing } from "@/components/app/ProgressRing";

/** The Outbox ring ticking down, with the actions you have while an email waits. */
export function DelayVisual() {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center gap-6 text-center">
      <ProgressRing value={s.progress} caption={s.label} className="cl-rise">
        <Countdown from={s.from} />
      </ProgressRing>
      <div className="cl-rise" style={{ animationDelay: "300ms" }}>
        <p className="m-0 font-display text-xl font-bold tracking-tight text-white">{s.subject}</p>
        <p className="mt-1 mb-0 text-sm text-navy-text">{s.to}</p>
      </div>
      <div className="cl-rise flex flex-wrap justify-center gap-2" style={{ animationDelay: "450ms" }}>
        {s.actions.map((action) => (
          <span
            key={action}
            className="rounded-full border border-navy-line px-4 py-2 text-[13px] text-navy-text"
          >
            {action}
          </span>
        ))}
        <span className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white shadow-cta">
          {s.primary}
        </span>
      </div>
    </div>
  );
}
