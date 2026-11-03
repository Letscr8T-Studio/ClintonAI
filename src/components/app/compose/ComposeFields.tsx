import type { Ref, RefObject } from "react";
import { composeCopy as copy } from "@/content/app/compose";
import { recipientsCopy } from "@/content/app/compose-options";
import type { Finding } from "@/lib/check/types";
import { cn } from "@/lib/cn";
import { AddressRow, FieldError, fieldInput, fieldLabel, fieldRow } from "./AddressRow";
import { MessageField } from "./MessageField";

export type DraftFields = { to: string; cc: string; bcc: string; subject: string; body: string };
export type FieldErrors = Partial<Record<"to" | "cc" | "bcc" | "body", string>>;
/** Cc and Bcc rows are hidden until asked for, or until they have something in them. */
export type ExtraRows = { cc: boolean; bcc: boolean };

type Props = {
  values: DraftFields;
  errors: FieldErrors;
  rows: ExtraRows;
  onShowRow: (row: keyof ExtraRows) => void;
  onChange: (field: keyof DraftFields, value: string) => void;
  toRef: Ref<HTMLInputElement>;
  subjectRef: Ref<HTMLInputElement>;
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  /** Clinton's open findings on the message, highlighted in the text. */
  flags: { findings: Finding[]; onFix: (finding: Finding) => void; onIgnore: (id: string) => void };
};

const reveal =
  "cursor-pointer rounded-full px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-paper hover:text-ink";

/** To, Cc, Bcc, Subject and Message, as hairline-separated rows. */
export function ComposeFields(props: Props) {
  const { values, errors, rows, onShowRow, onChange, flags, toRef, subjectRef, bodyRef } = props;
  return (
    <>
      <AddressRow
        id="compose-to"
        label={copy.to}
        value={values.to}
        onChange={(v) => onChange("to", v)}
        error={errors.to}
        placeholder={copy.toPlaceholder}
        inputRef={toRef}
      >
        {(["cc", "bcc"] as const).map((r) =>
          rows[r] ? null : (
            <button
              key={r}
              type="button"
              onClick={() => onShowRow(r)}
              aria-label={r === "cc" ? recipientsCopy.addCcLabel : recipientsCopy.addBccLabel}
              className={reveal}
            >
              {r === "cc" ? recipientsCopy.addCc : recipientsCopy.addBcc}
            </button>
          ),
        )}
      </AddressRow>
      {rows.cc ? (
        <AddressRow
          id="compose-cc"
          label={copy.cc}
          value={values.cc}
          onChange={(v) => onChange("cc", v)}
          error={errors.cc}
        />
      ) : null}
      {rows.bcc ? (
        <AddressRow
          id="compose-bcc"
          label={recipientsCopy.bcc}
          value={values.bcc}
          onChange={(v) => onChange("bcc", v)}
          error={errors.bcc}
          hint={recipientsCopy.bccHint}
        />
      ) : null}

      <div className={cn(fieldRow, "focus-within:bg-brand-wash/60")}>
        <label htmlFor="compose-subject" className={fieldLabel}>
          {copy.subject}
        </label>
        <input
          id="compose-subject"
          ref={subjectRef}
          type="text"
          value={values.subject}
          onChange={(e) => onChange("subject", e.target.value)}
          className={cn(fieldInput, "font-semibold")}
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
