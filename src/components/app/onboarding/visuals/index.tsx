import type { ComponentType, ReactNode } from "react";
import type { TourVisual } from "@/content/app/onboarding";
import { cn } from "@/lib/cn";
import { CheckVisual } from "./CheckVisual";
import { DelayVisual } from "./DelayVisual";
import { SafeSendVisual } from "./SafeSendVisual";

export type StageTone = "wash" | "ink" | "brand";

const tones: Record<StageTone, string> = {
  wash: "bg-brand-wash border border-brand-mist",
  ink: "bg-ink",
  brand: "stage-brand",
};

const tourVisuals: Record<TourVisual, { Visual: ComponentType; tone: StageTone }> = {
  check: { Visual: CheckVisual, tone: "wash" },
  delay: { Visual: DelayVisual, tone: "ink" },
  "safe-send": { Visual: SafeSendVisual, tone: "brand" },
};

type StageProps = { tone: StageTone; children: ReactNode; className?: string };

/** Rounded illustration panel. Decorative, so hidden from assistive tech. */
export function VisualStage({ tone, children, className }: StageProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "cl-rise relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[28px] px-5 py-8 sm:rounded-[32px] sm:px-10 sm:py-12 lg:min-h-[560px]",
        tones[tone],
        className,
      )}
    >
      {tone !== "wash" ? <div className="stage-grid absolute inset-0" /> : null}
      <div className="relative flex w-full justify-center">{children}</div>
    </div>
  );
}

export function TourVisualStage({ visual, className }: { visual: TourVisual; className?: string }) {
  const { Visual, tone } = tourVisuals[visual];
  return (
    <VisualStage tone={tone} className={className}>
      <Visual />
    </VisualStage>
  );
}
