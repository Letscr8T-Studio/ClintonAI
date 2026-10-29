"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { onboardingCopy as copy, tourSteps } from "@/content/app/onboarding";
import { DelayPicker } from "./DelayPicker";
import { NavButton } from "./NavButton";
import { OnboardingTopBar } from "./OnboardingTopBar";
import { TourSlide } from "./TourSlide";
import { TourVisualStage } from "./visuals";

const labels = [...tourSteps.map((s) => s.label), copy.delayStepLabel];
const DELAY_STEP = tourSteps.length;

/** Full-screen tour: three feature screens, then the Smart Delay choice. Focus follows each heading. */
export function OnboardingFlow({ defaultDelaySeconds }: { defaultDelaySeconds: number }) {
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    // Skip the first render so the page doesn't steal focus on load.
    if (moved.current) headingRef.current?.focus();
  }, [index]);

  const go = (next: number) => {
    moved.current = true;
    setIndex(next);
    window.scrollTo({ top: 0 });
  };

  const step = tourSteps[index];

  return (
    <div className="stage-paper min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-5 sm:px-8">
        <OnboardingTopBar labels={labels} index={index} onSkip={step ? () => go(DELAY_STEP) : undefined} />

        <main id="main" className="flex flex-1 items-center py-8 lg:py-12">
          {/* key replays the entrance choreography on every step */}
          <div key={index} className="w-full">
            {step ? (
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col">
                  <TourSlide
                    step={step}
                    number={index + 1}
                    total={tourSteps.length}
                    headingRef={headingRef}
                  />
                  <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    {index > 0 ? (
                      <NavButton variant="ghost" onClick={() => go(index - 1)}>
                        {copy.back}
                      </NavButton>
                    ) : null}
                    <NavButton onClick={() => go(index + 1)}>
                      {copy.next}
                      <ArrowRight size={16} />
                    </NavButton>
                  </div>
                </div>
                <TourVisualStage visual={step.id} className="order-first lg:order-none" />
              </div>
            ) : (
              <DelayPicker
                defaultSeconds={defaultDelaySeconds}
                headingRef={headingRef}
                onBack={() => go(DELAY_STEP - 1)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
