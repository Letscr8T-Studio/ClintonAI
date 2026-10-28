"use client";

import Script from "next/script";
import { useId } from "react";
import { buttonStyles } from "@/components/ui/Button";
import { waitlistCopy as copy } from "@/content/join";
import { cn } from "@/lib/cn";
import { TALLY_SCRIPT_SRC } from "@/lib/tally";
import { JoinedCard } from "./JoinedCard";
import { useWaitlist } from "./useWaitlist";

const rounded = "rounded-[clamp(12px,3vw,999px)]";

export function WaitlistForm() {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const w = useWaitlist();
  const loading = w.status === "loading";
  const invalid = w.status === "error";

  return (
    <>
      <Script src={TALLY_SCRIPT_SRC} strategy="lazyOnload" />

      {w.status === "joined" ? (
        <JoinedCard surveyDone={w.surveyDone} onStartSurvey={w.startSurvey} />
      ) : (
        <form
          noValidate
          aria-label="Join the waitlist"
          onSubmit={(e) => {
            e.preventDefault();
            void w.join();
          }}
          className="flex flex-col gap-2.5"
        >
          <div className="flex max-w-[500px] flex-wrap gap-2 rounded-[clamp(16px,3vw,999px)] border border-line-strong bg-white p-1.5 shadow-field">
            <label htmlFor={inputId} className="sr-only">
              {copy.label}
            </label>
            <input
              id={inputId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={copy.placeholder}
              value={w.email}
              onChange={(e) => w.setEmail(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={invalid ? errorId : undefined}
              disabled={loading}
              className={cn(
                "min-h-12 min-w-0 flex-[999_1_200px] border-0 bg-transparent px-4 font-sans text-base text-ink outline-none focus-visible:outline-2 focus-visible:outline-brand",
                rounded,
              )}
            />
            {/* Honeypot: hidden from people and screen readers; bots tend to fill it. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={w.honeypot}
              onChange={(e) => w.setHoneypot(e.target.value)}
              className="absolute -left-[9999px] size-px opacity-0"
              aria-hidden="true"
            />
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={cn(
                buttonStyles({ size: "lg" }),
                "min-h-12 flex-[1_0_auto] px-[22px] text-[15px] disabled:cursor-wait",
                rounded,
              )}
            >
              {loading ? copy.submitting : copy.submit}
            </button>
          </div>
          <p id={errorId} role="alert" className="mx-3 my-0 min-h-5 text-sm font-medium text-danger">
            {invalid ? w.error : ""}
          </p>
        </form>
      )}
    </>
  );
}
