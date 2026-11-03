import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

export const fieldRow = "flex items-center gap-3 border-b border-line px-5 sm:px-7";
export const fieldLabel = "w-16 shrink-0 py-4 text-sm text-muted";
export const fieldInput =
  "min-w-0 flex-1 bg-transparent py-4 text-[15px] text-ink outline-none placeholder:text-placeholder";

/** A field's error, as its own row under it (linked by aria-describedby). */
export function FieldError({ id, message }: { id: string; message?: string }) {
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

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  /** A short note read with the field ("Hidden from everyone else"). */
  hint?: string;
  inputRef?: Ref<HTMLInputElement>;
  /** Buttons at the end of the row (Cc, Bcc). */
  children?: ReactNode;
};

/** One recipients row (To, Cc or Bcc): a label, a comma-separated list, and its error. */
export function AddressRow({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  hint,
  inputRef,
  children,
}: Props) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");
  return (
    <>
      <div className={cn(fieldRow, "focus-within:bg-brand-wash/60")}>
        <label htmlFor={id} className={fieldLabel}>
          {label}
        </label>
        <input
          id={id}
          ref={inputRef}
          type="text"
          inputMode="email"
          autoComplete="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={fieldInput}
        />
        {hint ? (
          <span id={hintId} className="hidden shrink-0 text-xs text-muted sm:inline">
            {hint}
          </span>
        ) : null}
        {children}
      </div>
      <FieldError id={errorId} message={error} />
    </>
  );
}
