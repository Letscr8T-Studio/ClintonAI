import type { Ref, RefObject } from "react";
import { composeCopy as copy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { cn } from "@/lib/cn";
import { MessageField } from "./MessageField";

export type DraftFields = { to: string; cc: string; subject: string; body: string };
export type FieldErrors = Partial<Record<"to" | "cc" | "body", string>>;

type Props = {
  values: DraftFields;
  errors: FieldErrors;
  showCc: boolean;
  onShowCc: () => void;
  onChange: (field: keyof DraftFields, value: string) => void;
  toRef: Ref<HTMLInputElement>;
  subjectRef: Ref<HTMLInputElement>;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  /** Clinton's open findings on the message, highlighted in the text. */
  flags: { findings: Finding[]; onFix: (finding: Finding) => void; onIgnore: (id: string) => void };
};

const row = "flex items-center gap-3 border-b border-line px-5 sm:px-7";
const label = "w-16 shrink-0 py-4 text-sm text-muted";
const input =
  "min-w-0 flex-1 bg-transparent py-4 text-[15px] text-ink outline-none placeholder:text-placeholder";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="m-0 border-b border-line bg-danger-bg px-5 py-2 text-[13px] font-medium text-danger-ink sm:px-7"
    >
      {message}
    </p>
  );
}

/** To, Cc, Subject and Message, as hairline-separated rows. */
export function ComposeFields({
  values,
  errors,
  showCc,
  onShowCc,
  onChange,
  toRef,
  subjectRef,
  bodyRef,
  flags,
}: Props) {
  return (
    <>
      <div className={cn(row, "focus-within:bg-brand-wash/60")}>
        <label htmlFor="compose-to" className={label}>
          {copy.to}
        </label>
        <input
          id="compose-to"
          ref={toRef}
          type="text"
          inputMode="email"
          autoComplete="email"
          value={values.to}
          onChange={(e) => onChange("to", e.target.value)}
          placeholder={copy.toPlaceholder}
          aria-invalid={Boolean(errors.to)}
          aria-describedby={errors.to ? "compose-to-error" : undefined}
          className={input}
        />
        {!showCc ? (
          <button
            type="button"
            onClick={onShowCc}
            className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
          >
            {copy.addCc}
          </button>
        ) : null}
      </div>
      <FieldError id="compose-to-error" message={errors.to} />

      {showCc ? (
        <>
          <div className={cn(row, "focus-within:bg-brand-wash/60")}>
            <label htmlFor="compose-cc" className={label}>
              {copy.cc}
            </label>
            <input
              id="compose-cc"
              type="text"
              inputMode="email"
              value={values.cc}
              onChange={(e) => onChange("cc", e.target.value)}
              aria-invalid={Boolean(errors.cc)}
              aria-describedby={errors.cc ? "compose-cc-error" : undefined}
              className={input}
            />
          </div>
          <FieldError id="compose-cc-error" message={errors.cc} />
        </>
      ) : null}

      <div className={cn(row, "focus-within:bg-brand-wash/60")}>
        <label htmlFor="compose-subject" className={label}>
          {copy.subject}
        </label>
        <input
          id="compose-subject"
          ref={subjectRef}
          type="text"
          value={values.subject}
          onChange={(e) => onChange("subject", e.target.value)}
          className={cn(input, "font-semibold")}
        />
      </div>

      <label htmlFor="compose-body" className="sr-only">
        {copy.body}
      </label>
      <MessageField
        value={values.body}
        onChange={(v) => onChange("body", v)}
        placeholder={copy.bodyPlaceholder}
        invalid={Boolean(errors.body)}
        describedBy={errors.body ? "compose-body-error" : undefined}
        fieldRef={bodyRef}
        {...flags}
      />
      <FieldError id="compose-body-error" message={errors.body} />
    </>
  );
}
