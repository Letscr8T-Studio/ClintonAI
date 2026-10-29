import { useId } from "react";
import { Check } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { panelCopy as copy } from "@/content/app/compose";
import { delayOptions } from "@/content/app/onboarding";
import type { CheckState } from "./useComposeCheck";

export type SendControls = {
  delaySeconds: number;
  onDelayChange: (seconds: number) => void;
  onSend: () => void;
  sending: boolean;
  error: string | null;
};

/** All clear: choose this email's Smart Delay and send it to the Outbox. */
export function ReadyPanel({ state, send }: { state: CheckState; send: SendControls }) {
  const delayId = useId();
  const reviewed = state.findings.length > 0;
  return (
    <div className="stage-brand relative overflow-hidden rounded-[28px] p-6 text-white sm:p-7">
      <div aria-hidden="true" className="stage-grid absolute inset-0" />
      <div className="relative">
        {state.stale ? (
          <p className="m-0 mb-4 rounded-xl bg-white/90 px-3.5 py-2.5 text-[13px] text-body">{copy.stale}</p>
        ) : null}
        <span
          aria-hidden="true"
          className="cl-pop inline-flex size-12 items-center justify-center rounded-full bg-white"
        >
          <Check size={20} color={palette.brand} />
        </span>
        <h2 className="mt-4 mb-0 font-display text-2xl font-bold tracking-tight">{copy.readyTitle}</h2>
        <p className="mt-1.5 mb-0 text-sm text-on-brand">
          {reviewed ? copy.readyAfterReview : copy.readyBody}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3">
          <label htmlFor={delayId} className="text-sm font-medium">
            {copy.delayLabel}
          </label>
          <select
            id={delayId}
            value={send.delaySeconds}
            onChange={(e) => send.onDelayChange(Number(e.target.value))}
            className="cursor-pointer rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white"
          >
            {delayOptions.map((o) => (
              <option key={o.seconds} value={o.seconds} className="text-ink">
                {copy.delayOption(o.minutes)}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 mb-0 text-[13px] text-on-brand">{copy.delayHint}</p>

        {send.error ? (
          <p
            role="alert"
            className="mt-4 mb-0 rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-danger-ink"
          >
            {send.error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={send.onSend}
          disabled={send.sending}
          aria-busy={send.sending}
          className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-white px-6 text-[15px] font-semibold text-brand-deep transition-[translate] hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
        >
          {send.sending ? copy.sending : copy.send}
        </button>
      </div>
    </div>
  );
}
