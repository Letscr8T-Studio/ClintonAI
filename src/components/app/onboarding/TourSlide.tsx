import type { Ref } from "react";
import { CheckList } from "@/components/ui/CheckList";
import type { TourStep } from "@/content/app/onboarding";

/** One tour screen. The heading takes focus when the step changes (see OnboardingFlow). */
export function TourSlide({ step, headingRef }: { step: TourStep; headingRef: Ref<HTMLHeadingElement> }) {
  return (
    <section aria-labelledby={`tour-${step.id}`}>
      <p className="font-mono text-xs font-medium tracking-wider text-brand uppercase">{step.eyebrow}</p>
      <h1
        id={`tour-${step.id}`}
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 font-display text-2xl font-bold tracking-tight outline-none sm:text-3xl"
      >
        {step.title}
      </h1>
      <p className="mt-3 text-body">{step.body}</p>
      <CheckList items={step.points} className="mt-5" />
    </section>
  );
}
