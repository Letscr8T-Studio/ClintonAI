import { DotList } from "@/components/ui/CheckList";
import { palette } from "@/config/brand";
import { ArrowUp, ClintonMark } from "@/components/ui/icons";
import { productShot } from "@/content/product-shot";

const divider = "border-b border-line-soft px-[18px]";

/** Phone compose screen with the AI check sheet sliding up. Exposed to assistive tech as one image. */
export function PhoneMock() {
  const p = productShot.phone;
  return (
    <div
      role="img"
      aria-label={p.label}
      className="anim-phone box-border w-[min(100%,310px)] rounded-[48px] bg-ink p-[11px] shadow-[0_50px_100px_rgba(10,20,90,0.5),inset_0_0_0_1.5px_var(--color-navy-line)]"
    >
      <div className="flex min-h-[590px] flex-col overflow-hidden rounded-[38px] bg-white text-ink">
        <div className="flex justify-center pt-2.5">
          <span className="h-[26px] w-[92px] rounded-full bg-ink" />
        </div>
        <div className={`flex items-center justify-between pt-3.5 pb-2.5 ${divider}`}>
          <span className="text-sm text-brand">{p.cancel}</span>
          <span className="text-[15px] font-semibold">{p.title}</span>
          <span className="inline-flex size-[30px] items-center justify-center rounded-full bg-brand">
            <ArrowUp />
          </span>
        </div>
        <div className={`flex flex-wrap items-center gap-2 py-2.5 text-[13px] ${divider}`}>
          <span className="text-subtle">To:</span>
          <span className="rounded-md bg-danger-bg px-[7px] py-0.5 font-semibold text-danger-ink">
            {p.to}
          </span>
        </div>
        <div className={`py-2.5 text-sm font-semibold ${divider}`}>{p.subject}</div>
        <div className="flex-auto px-[18px] py-3.5 text-sm leading-[1.55] text-body">
          Hi <span className="rounded-[3px] bg-highlight px-[3px] text-ink">{p.greetingName}</span>
          {p.body}
          <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] border border-line px-2.5 py-2 text-xs text-ink">
            {p.attachment}
          </div>
        </div>
        <div className="anim-sheet mx-2.5 mb-2.5 flex flex-col gap-2.5 rounded-3xl bg-ink p-4 text-cream">
          <div className="flex items-center gap-2">
            <ClintonMark size={16} color={palette.brandSoft} />
            <span className="font-mono text-[11px] tracking-[0.04em] text-navy-text">{p.checkTitle}</span>
          </div>
          <DotList items={p.findings} dotClassName="bg-amber" className="text-[13px] leading-[1.4]" />
          <div className="mt-0.5 flex gap-2">
            <span className="flex-1 rounded-full bg-cream py-[9px] text-center text-[13px] font-semibold text-ink">
              {p.fix}
            </span>
            <span className="flex-1 rounded-full border border-navy-line py-[9px] text-center text-[13px]">
              {p.ignore}
            </span>
          </div>
        </div>
        <div className="flex justify-center pt-1 pb-2.5">
          <span className="h-1 w-[110px] rounded-full bg-ink" />
        </div>
      </div>
    </div>
  );
}
