"use client";

import { useActionState, useState, useTransition } from "react";
import { startEnrolment, verifyCode, type Enrolment } from "@/app/owner/mfa/actions";
import { buttonStyles } from "@/components/ui/Button";
import { mfaCopy as copy } from "@/content/owner";

const field =
  "w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-ink";

/** Set up (QR code) or enter the authenticator code. The code form is the same either way. */
export function MfaForm({ mode }: { mode: "enroll" | "verify" }) {
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [starting, startTransition] = useTransition();
  const [state, action, pending] = useActionState(verifyCode, {});
  const ready = mode === "verify" || (enrolment && !("error" in enrolment));
  const error = state.error ?? (enrolment && "error" in enrolment ? enrolment.error : null);

  return (
    <div className="flex flex-col gap-5">
      {mode === "enroll" && !ready ? (
        <button
          type="button"
          disabled={starting}
          onClick={() => startTransition(async () => setEnrolment(await startEnrolment()))}
          className={buttonStyles({ size: "lg", shape: "soft" })}
        >
          {starting ? copy.starting : copy.start}
        </button>
      ) : null}

      {enrolment && !("error" in enrolment) ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="m-0 text-sm text-body">{copy.scan}</p>
          {/* Supabase returns the QR code as an SVG data URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrolment.qrCode}
            alt={copy.qrAlt}
            width={180}
            height={180}
            className="rounded-xl bg-white p-2"
          />
          <p className="m-0 text-xs text-muted">
            {copy.manual} <code className="font-mono break-all text-ink">{enrolment.secret}</code>
          </p>
        </div>
      ) : null}

      {ready ? (
        <form action={action} className="flex flex-col gap-3">
          {enrolment && !("error" in enrolment) ? (
            <input type="hidden" name="factorId" value={enrolment.factorId} />
          ) : null}
          <label htmlFor="mfa-code" className="text-sm font-medium text-ink">
            {copy.codeLabel}
          </label>
          <input
            id="mfa-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            aria-invalid={Boolean(state.error)}
            aria-describedby={error ? "mfa-error" : undefined}
            className={field}
          />
          <button type="submit" disabled={pending} className={buttonStyles({ size: "lg", shape: "soft" })}>
            {pending ? copy.checking : copy.submit}
          </button>
        </form>
      ) : null}

      {error ? (
        <p id="mfa-error" role="alert" className="m-0 text-sm font-medium text-danger-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
