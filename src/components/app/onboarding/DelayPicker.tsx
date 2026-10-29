"use client";

import { useActionState, useId, type Ref } from "react";
import { finishOnboarding, type OnboardingState } from "@/app/onboarding/actions";
import { buttonStyles } from "@/components/ui/Button";
import { delayOptions, onboardingCopy as copy } from "@/content/app/onboarding";
import { cn } from "@/lib/cn";

type Props = { defaultSeconds: number; headingRef: Ref<HTMLHeadingElement>; onBack: () => void };

/** Last onboarding step: pick the default Smart Delay and finish. */
export function DelayPicker({ defaultSeconds, headingRef, onBack }: Props) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(finishOnboarding, {});
  const headingId = useId();
  const errorId = useId();

  return (
    <form action={action} aria-labelledby={headingId}>
      <h1
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-2xl font-bold tracking-tight outline-none sm:text-3xl"
      >
        {copy.delayTitle}
      </h1>
      <p className="mt-3 text-body">{copy.delayBody}</p>

      <fieldset className="mt-6" aria-describedby={state.error ? errorId : undefined}>
        <legend className="mb-3 text-sm font-medium text-body">{copy.delayLegend}</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {delayOptions.map((option) => (
            <label
              key={option.seconds}
              className="flex cursor-pointer flex-col rounded-xl border border-line-strong px-4 py-3 has-checked:border-brand has-checked:bg-brand-wash has-focus-visible:outline-2 has-focus-visible:outline-brand"
            >
              <input
                type="radio"
                name="delaySeconds"
                value={option.seconds}
                defaultChecked={option.seconds === defaultSeconds}
                className="sr-only"
              />
              <span className="font-semibold text-ink">{option.label}</span>
              {option.hint ? <span className="text-xs text-muted">{option.hint}</span> : null}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p id={errorId} role="alert" className="mt-4 text-sm font-medium text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className={buttonStyles({ variant: "secondary", shape: "soft" })}
        >
          {copy.back}
        </button>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={cn(buttonStyles({ shape: "soft" }), "sm:min-w-56")}
        >
          {pending ? copy.finishing : copy.finish}
        </button>
      </div>
    </form>
  );
}
