import type { ComponentType } from "react";
import { stepSamples, type StepVisual } from "@/content/how-it-works";

// Illustrations for the three "How it works" steps.

const frame = "box-border flex min-h-[150px] flex-col justify-center rounded-2xl p-[18px]";

function ConnectVisual() {
  const s = stepSamples.connect;
  return (
    <div className={`${frame} items-center gap-3 bg-brand-wash`}>
      <span className="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_10px_24px_-16px_rgba(17,19,26,0.4)]">
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-tint font-display text-[12px] font-bold text-brand">
          G
        </span>
        {s.button}
      </span>
      <span className="text-xs text-subtle">{s.permission}</span>
    </div>
  );
}

function CheckVisual() {
  return (
    <div className={`${frame} gap-2 bg-brand-wash`}>
      {stepSamples.check.warnings.map((warning) => (
        <div
          key={warning}
          className="flex items-center gap-2 rounded-xl border border-amber-line bg-white px-3 py-2.5 text-[13px] text-amber-ink"
        >
          <span className="size-[7px] rounded-full bg-amber-dot" />
          {warning}
        </div>
      ))}
    </div>
  );
}

function UnsendVisual() {
  const s = stepSamples.unsend;
  return (
    <div className={`${frame} items-center gap-3 bg-ink text-center`}>
      <span className="font-mono text-[22px] tracking-[-0.02em] text-white">{s.time}</span>
      <span className="rounded-full bg-brand px-[18px] py-2 text-[13px] font-semibold text-white">
        {s.action}
      </span>
    </div>
  );
}

export const stepVisuals: Record<StepVisual, ComponentType> = {
  connect: ConnectVisual,
  check: CheckVisual,
  unsend: UnsendVisual,
};
