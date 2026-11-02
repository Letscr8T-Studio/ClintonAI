"use client";

import { useActionState, useId, useState, type Ref } from "react";
import { finishOnboarding, type OnboardingState } from "@/app/onboarding/actions";
import { ArrowRight } from "@/components/ui/icons";
import { delayOptions, onboardingCopy as copy } from "@/content/app/onboarding";
import { SMART_DELAY, delayClock } from "@/lib/validation/profile";
import { ProgressRing } from "@/components/app/ProgressRing";
import { VisualStage } from "./visuals";
import { DelayTiles } from "./DelayTiles";
import { NavButton } from "./NavButton";

type Props = { defaultSeconds: number; headingRef: Ref<HTMLHeadingElement>; onBack: () => void };

/** Last step: pick the default Smart Delay, with a live preview, and finish. */
export function DelayPicker({ defaultSeconds, headingRef, onBack }: Props) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(finishOnboarding, {});
  const [seconds, setSeconds] = useState(defaultSeconds);
  const selected = delayOptions.find((o) => o.seconds === seconds);
  const headingId = useId();
  const errorId = useId();
  const moodId = useId();

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <form action={action} aria-labelledby={headingId} className="flex flex-col">
        <h1
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="cl-rise m-0 font-display text-[clamp(40px,5.2vw,72px)] leading-[0.98] font-bold tracking-[-0.045em] outline-none"
        >
          {copy.delayTitle} <span className="block text-brand">{copy.delayAccent}</span>
        </h1>
        <p
          className="cl-rise mt-6 mb-8 max-w-[520px] text-[clamp(16px,1.4vw,19px)] leading-relaxed text-muted"
          style={{ animationDelay: "80ms" }}
        >
          {copy.delayBody}
        </p>

        <DelayTiles
          value={seconds}
          onChange={setSeconds}
          describedBy={state.error ? `${moodId} ${errorId}` : moodId}
        />
        <p id={moodId} className="mt-4 mb-0 min-h-6 text-[15px] text-ink" aria-live="polite">
          {selected?.mood}
        </p>

        {state.error ? (
          <p id={errorId} role="alert" className="mt-3 mb-0 text-sm font-medium text-danger">
            {state.error}
          </p>
        ) : null}

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <NavButton variant="ghost" onClick={onBack}>
            {copy.back}
          </NavButton>
          <NavButton type="submit" disabled={pending} aria-busy={pending}>
            {pending ? copy.finishing : copy.finish}
            <ArrowRight size={16} />
          </NavButton>
        </div>
      </form>

      <VisualStage tone="ink" className="hidden lg:flex">
        <div className="flex flex-col items-center gap-6 text-center">
          <ProgressRing value={seconds / SMART_DELAY.max} caption={copy.delayStepLabel}>
            {delayClock(seconds)}
          </ProgressRing>
          <p className="m-0 max-w-[320px] text-[15px] text-navy-text">
            {selected?.off
              ? copy.previewOff
              : copy.previewCaption(selected?.minutes ?? String(Math.round(seconds / 60)))}
          </p>
        </div>
      </VisualStage>
    </div>
  );
}
