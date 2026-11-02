import type { Ref } from "react";
import type { TourStep } from "@/content/app/onboarding";

const at = (ms: number) => ({ animationDelay: `${ms}ms` });
const pad = (n: number) => String(n).padStart(2, "0");

type Props = { step: TourStep; number: number; total: number; headingRef: Ref<HTMLHeadingElement> };

/** Text side of a tour screen. The heading takes focus when the step changes (see OnboardingFlow). */
export function TourSlide({ step, number, total, headingRef }: Props) {
  return (
    <section aria-labelledby={`tour-${step.id}`} className="flex flex-col">
      <p className="cl-rise m-0 flex items-baseline gap-3 font-mono text-sm text-muted">
        <span className="text-brand-ink">{pad(number)}</span>
        <span aria-hidden="true">/ {pad(total)}</span>
        <span className="ml-2 tracking-wider uppercase">{step.label}</span>
      </p>
      <h1
        id={`tour-${step.id}`}
        ref={headingRef}
        tabIndex={-1}
        className="cl-rise mt-5 mb-0 font-display text-[clamp(40px,5.2vw,72px)] leading-[0.98] font-bold tracking-[-0.045em] outline-none"
        style={at(80)}
      >
        {step.title} <span className="block text-brand-ink">{step.accent}</span>
      </h1>
      <p
        className="cl-rise mt-6 mb-0 max-w-[520px] text-[clamp(16px,1.4vw,19px)] leading-relaxed text-muted"
        style={at(160)}
      >
        {step.body}
      </p>
      <ol className="m-0 mt-8 flex max-w-[520px] list-none flex-col p-0">
        {step.points.map((point, i) => (
          <li
            key={point}
            className="cl-rise flex items-baseline gap-4 border-t border-line py-3.5 text-[15px] text-ink last:border-b"
            style={at(240 + i * 80)}
          >
            <span aria-hidden="true" className="font-mono text-xs text-brand-ink">
              {pad(i + 1)}
            </span>
            {point}
          </li>
        ))}
      </ol>
    </section>
  );
}
