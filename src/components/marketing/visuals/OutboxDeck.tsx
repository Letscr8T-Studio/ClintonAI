import { Countdown } from "@/components/ui/Countdown";
import { Warning } from "@/components/ui/icons";
import { productShot } from "@/content/product-shot";

const outlineAction = "rounded-full border border-line-strong px-3.5 py-1.5 text-[13px]";

/** Fanned Outbox card + AI check warning on the blue "Send without fear" panel. */
export function OutboxDeck() {
  const { outbox, warning } = productShot;
  return (
    <div aria-hidden="true" className="flex flex-col items-start px-1 pt-1.5 pb-2">
      <div
        className="anim-fan-a box-border flex w-[min(100%,400px)] flex-col gap-3 rounded-[22px] bg-cream p-[22px] text-ink shadow-deck"
        style={{ transform: "rotate(-3deg)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[13px] text-brand">{outbox.label}</span>
          <span className="rounded-full bg-brand-tint px-[11px] py-[3px] font-mono text-[13px] text-brand">
            <Countdown />
          </span>
        </div>
        <p className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">{outbox.subject}</p>
        <p className="m-0 text-sm text-muted">{outbox.meta}</p>
        <div className="flex flex-wrap gap-2">
          {outbox.actions.map((action) => (
            <span key={action} className={outlineAction}>
              {action}
            </span>
          ))}
          <span className="rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white">
            {outbox.primaryAction}
          </span>
        </div>
      </div>
      <div
        className="anim-fan-b -mt-3.5 ml-[clamp(0px,6vw,60px)] box-border flex w-[min(92%,370px)] items-center gap-3 rounded-[18px] border border-amber-line bg-amber-bg px-[18px] py-4 shadow-[0_26px_60px_rgba(10,20,90,0.3)]"
        style={{ transform: "rotate(2deg)" }}
      >
        <Warning />
        <p className="m-0 text-sm leading-[1.4] text-amber-ink">{warning}</p>
      </div>
    </div>
  );
}
