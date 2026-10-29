"use client";

import { useEffect, useRef, useState } from "react";
import { buttonStyles } from "@/components/ui/Button";
import { onboardingCopy as copy, tourSteps } from "@/content/app/onboarding";
import { cn } from "@/lib/cn";
import { DelayPicker } from "./DelayPicker";
import { TourSlide } from "./TourSlide";

const TOTAL = tourSteps.length + 1; // tour screens + the delay picker

/** Three tour screens, then the Smart Delay choice. Focus moves to each new heading. */
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
  };

  const tourStep = tourSteps[index];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted" aria-live="polite">
          {copy.progress(index + 1, TOTAL)}
        </p>
        <ol className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL }, (_, i) => (
            <li
              key={i}
              className={cn("h-1.5 w-6 rounded-full", i <= index ? "bg-brand" : "bg-line-strong")}
            />
          ))}
        </ol>
      </div>

      {tourStep ? (
        <>
          <TourSlide step={tourStep} headingRef={headingRef} />
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {index === 0 ? (
              <button
                type="button"
                onClick={() => go(tourSteps.length)}
                className={buttonStyles({ variant: "secondary", shape: "soft" })}
              >
                {copy.skip}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go(index - 1)}
                className={buttonStyles({ variant: "secondary", shape: "soft" })}
              >
                {copy.back}
              </button>
            )}
            <button type="button" onClick={() => go(index + 1)} className={buttonStyles({ shape: "soft" })}>
              {copy.next}
            </button>
          </div>
        </>
      ) : (
        <DelayPicker
          defaultSeconds={defaultDelaySeconds}
          headingRef={headingRef}
          onBack={() => go(tourSteps.length - 1)}
        />
      )}
    </div>
  );
}
