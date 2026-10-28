import { Check } from "@/components/ui/icons";
import { dashboardSample, type SentTone } from "@/content/dashboard";
import { cn } from "@/lib/cn";

const statusTone: Record<SentTone, string> = {
  open: "font-semibold text-brand",
  strong: "text-ink",
  quiet: "text-subtle",
};

/** Browser-framed preview of the user dashboard. Exposed to assistive tech as one image. */
export function DashboardMock() {
  const d = dashboardSample;
  return (
    <div
      role="img"
      aria-label={d.label}
      className="anim-reveal overflow-hidden rounded-[24px] border border-line bg-white shadow-mock"
    >
      <div className="flex items-center gap-1.5 border-b border-line bg-paper px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-full bg-line-strong" />
        ))}
        <span className="ml-3 rounded-md bg-white px-3 py-1 font-mono text-[11px] text-subtle">{d.host}</span>
      </div>
      <div className="flex flex-col gap-3 p-[clamp(12px,2vw,20px)]">
        <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-4">
          {d.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line px-3 py-2.5">
              <p className="m-0 text-[11.5px] text-subtle">{s.label}</p>
              <p
                className={cn(
                  "m-0 font-display text-[22px] font-bold tracking-[-0.02em]",
                  s.accent ? "text-brand" : "text-ink",
                )}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-line">
          <p className="m-0 border-b border-line px-3.5 py-2.5 text-[13px] font-semibold">{d.tableTitle}</p>
          <ul className="m-0 list-none p-0">
            {d.rows.map((r) => (
              <li
                key={r.subject}
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 border-b border-line-soft px-3.5 py-2.5 text-[12.5px] last:border-b-0 min-[560px]:grid-cols-[0.7fr_1.4fr_1fr_0.9fr]"
              >
                <span className="font-semibold text-ink">{r.to}</span>
                <span className="hidden truncate text-body min-[560px]:block">{r.subject}</span>
                <span className={cn("justify-self-end min-[560px]:justify-self-start", statusTone[r.tone])}>
                  {r.status}
                </span>
                <span className="text-subtle min-[560px]:text-right">{r.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl bg-ink px-3.5 py-3 text-[12.5px] text-white">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand">
            <Check size={12} />
          </span>
          {d.caught}
        </div>
      </div>
    </div>
  );
}
