import { ClintonMark, Warning } from "@/components/ui/icons";
import { checkSample as s } from "@/content/app/tour-visuals";

const at = (ms: number) => ({ animationDelay: `${ms}ms` });

/** An email with two risky phrases highlighted, and Clinton's findings popping in. */
export function CheckVisual() {
  return (
    <div className="relative w-full max-w-[440px] pb-6">
      <article className="cl-rise rounded-[22px] bg-surface p-5 shadow-mock" style={{ rotate: "-1.5deg" }}>
        <div className="flex items-center justify-between border-b border-line pb-3 text-[13px] text-muted">
          <span>
            To <span className="font-medium text-ink">{s.to}</span>
          </span>
          <span className="font-mono text-[11px] text-brand-ink">DRAFT</span>
        </div>
        <p className="mt-3 mb-2 font-display text-lg font-bold tracking-tight">{s.subject}</p>
        <p className="m-0 text-[14px] leading-[1.7] text-body">
          {s.greeting}
          <span className="cl-mark px-0.5" style={at(700)}>
            {s.wrongName}
          </span>
          {s.middle}
          <span className="cl-mark px-0.5" style={at(1000)}>
            {s.risky}
          </span>
          {s.end}
        </p>
      </article>

      <div
        className="cl-pop relative -mt-4 ml-[8%] rounded-[20px] bg-night p-4 text-white shadow-deck"
        style={{ ...at(1400), rotate: "1.5deg" }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand">
            <ClintonMark size={12} />
          </span>
          <span className="font-mono text-[11px] tracking-wider text-navy-text uppercase">{s.caught}</span>
        </div>
        <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
          {s.findings.map((finding, i) => (
            <li
              key={finding}
              className="cl-slide flex items-start gap-2.5 rounded-xl bg-amber-bg px-3 py-2.5 text-[13px] leading-snug text-amber-ink"
              style={at(1700 + i * 180)}
            >
              <Warning size={16} className="mt-px shrink-0" />
              {finding}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="rounded-full bg-brand px-3.5 py-1.5 font-semibold">{s.fix}</span>
          <span className="rounded-full border border-navy-line px-3.5 py-1.5 text-navy-text">
            {s.ignore}
          </span>
        </div>
      </div>
    </div>
  );
}
