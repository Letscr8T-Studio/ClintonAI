import { delayOptions, onboardingCopy as copy } from "@/content/app/onboarding";

type Props = { value: number; onChange: (seconds: number) => void; describedBy: string };

/** Native radio group styled as a row of tiles (arrow keys move between them). */
export function DelayTiles({ value, onChange, describedBy }: Props) {
  return (
    <fieldset
      className="cl-rise m-0 border-0 p-0"
      style={{ animationDelay: "160ms" }}
      aria-describedby={describedBy}
    >
      <legend className="mb-3 p-0 font-mono text-[11px] tracking-wider text-muted uppercase">
        {copy.delayLegend}
      </legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {delayOptions.map((option) => (
          <label
            key={option.seconds}
            className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-line-strong bg-white px-2 pt-4 pb-3 transition-[translate,background-color,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brand-mist has-checked:-translate-y-1 has-checked:border-brand has-checked:bg-brand has-checked:shadow-cta has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-brand motion-reduce:transition-none"
          >
            <input
              type="radio"
              name="delaySeconds"
              value={option.seconds}
              checked={value === option.seconds}
              onChange={() => onChange(option.seconds)}
              className="sr-only"
              aria-label={option.off ? copy.offLabel : copy.optionLabel(option.minutes, option.recommended)}
            />
            <span
              aria-hidden="true"
              className="font-display text-[28px] leading-none font-bold tracking-tight text-ink group-has-checked:text-white"
            >
              {option.minutes}
            </span>
            <span
              aria-hidden="true"
              className="mt-1 font-mono text-[11px] text-muted group-has-checked:text-on-brand"
            >
              {option.off ? copy.offUnit : copy.minutesUnit}
            </span>
            {option.recommended ? (
              <span
                aria-hidden="true"
                className="absolute -top-2.5 rounded-full bg-amber px-2 py-0.5 font-mono text-[9px] font-medium tracking-wider text-amber-ink uppercase"
              >
                {copy.recommended}
              </span>
            ) : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
