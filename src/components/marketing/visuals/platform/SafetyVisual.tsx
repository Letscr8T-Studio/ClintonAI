import { DotList } from "@/components/ui/CheckList";
import { Countdown } from "@/components/ui/Countdown";
import { Sparkle } from "@/components/ui/icons";
import { safetySample } from "@/content/platform-samples";

export function SafetyVisual() {
  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-2.5 rounded-[20px] bg-brand-wash p-3.5">
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <span className="inline-flex size-5 items-center justify-center rounded-md bg-ink">
            <Sparkle size={11} />
          </span>
          AI check
        </span>
        <DotList items={safetySample.warnings} className="text-[12.5px] text-amber-ink" />
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5">
        <span className="text-xs font-semibold text-ink">Smart Delay</span>
        <span className="font-mono text-[26px] tracking-[-0.03em] text-brand">
          <Countdown />
        </span>
        <span className="text-[12px] text-subtle">until it sends · Edit · Cancel</span>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-ink p-3.5 text-white">
        <span className="text-xs font-semibold text-navy-text">Safe Send</span>
        <span className="font-mono text-[22px] tracking-[-0.02em]">{safetySample.unsendTime}</span>
        <span className="self-start rounded-full bg-brand px-3 py-1 text-[12px] font-semibold">Unsend</span>
      </div>
    </div>
  );
}
