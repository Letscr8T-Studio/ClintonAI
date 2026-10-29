"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { ClintonMark } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { composeCopy as copy } from "@/content/app/compose";
import type { Finding } from "@/lib/check/types";
import { invalidAddresses, splitAddresses } from "@/lib/validation/compose";
import { ClintonPanel } from "./ClintonPanel";
import { ComposeFields, type DraftFields, type FieldErrors } from "./ComposeFields";
import { useComposeCheck } from "./useComposeCheck";

const empty: DraftFields = { to: "", cc: "", subject: "", body: "" };

function validate(values: DraftFields): FieldErrors {
  const errors: FieldErrors = {};
  const to = splitAddresses(values.to);
  const badTo = invalidAddresses(to);
  if (to.length === 0) errors.to = copy.needRecipient;
  else if (badTo.length) errors.to = copy.invalidAddresses(badTo.join(", "));
  const badCc = invalidAddresses(splitAddresses(values.cc));
  if (badCc.length) errors.cc = copy.invalidAddresses(badCc.join(", "));
  if (!values.body.trim()) errors.body = copy.needBody;
  return errors;
}

/** Compose with Clinton beside it: write, press Check & send, review what Clinton caught. */
export function ComposeWorkspace({ fromEmail }: { fromEmail: string }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showCc, setShowCc] = useState(false);
  const { state, check, resolve, sendAnyway, markEdited } = useComposeCheck();
  const toRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // On phones the panel sits below the form: bring the result into view.
  useEffect(() => {
    if ((state.status === "review" || state.status === "ready") && window.innerWidth < 1024) {
      panel.current?.scrollIntoView({ block: "start" });
    }
  }, [state.status]);

  const change = (field: keyof DraftFields, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }));
    markEdited();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    void check({
      to: splitAddresses(values.to),
      cc: splitAddresses(values.cc),
      subject: values.subject,
      body: values.body,
      attachments: [],
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) submit();
  };

  /**
   * Fix it: swap in Clinton's suggestion and select it, so the change is visible and easy to undo.
   * Show me (no suggestion, or the words have since changed): jump to the words instead.
   */
  const fix = ({ id, field, excerpt, suggestion }: Finding) => {
    resolve(id);
    const el = { to: toRef, subject: subjectRef, body: bodyRef }[field].current;
    const current = values[field];
    const at = excerpt ? current.indexOf(excerpt) : -1;
    const select = (start: number, length: number) => {
      el?.focus();
      if (start >= 0) el?.setSelectionRange(start, start + length);
    };
    if (at >= 0 && suggestion) {
      // Applying Clinton's own fix is not a user edit, so the check result stays current.
      setValues((v) => ({
        ...v,
        [field]: current.slice(0, at) + suggestion + current.slice(at + excerpt!.length),
      }));
      requestAnimationFrame(() => select(at, suggestion.length));
      return;
    }
    select(at, excerpt?.length ?? 0);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <form
        onSubmit={submit}
        onKeyDown={onKeyDown}
        noValidate
        className="cl-rise overflow-hidden rounded-[28px] border border-line bg-white shadow-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
          <h1 className="m-0 font-display text-xl font-bold tracking-tight">{copy.title}</h1>
          <p className="m-0 flex min-w-0 items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[13px] text-body">
            <GoogleMark size={14} />
            <span className="sr-only">{copy.from}: </span>
            <span className="truncate">{fromEmail}</span>
          </p>
        </div>
        <ComposeFields
          values={values}
          errors={errors}
          showCc={showCc}
          onShowCc={() => setShowCc(true)}
          onChange={change}
          toRef={toRef}
          subjectRef={subjectRef}
          bodyRef={bodyRef}
        />
        <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="m-0 text-xs text-muted">
            {copy.footer}{" "}
            <kbd className="ml-1 hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              {copy.shortcut}
            </kbd>
          </p>
          <button
            type="submit"
            disabled={state.status === "checking"}
            aria-busy={state.status === "checking"}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-brand px-6 text-[15px] font-semibold text-white shadow-cta transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
          >
            <ClintonMark size={14} color={palette.white} />
            {state.status === "checking" ? copy.checking : copy.submit}
          </button>
        </div>
      </form>
      <div
        ref={panel}
        className="cl-rise scroll-mt-24 lg:sticky lg:top-24"
        style={{ animationDelay: "120ms" }}
      >
        <ClintonPanel state={state} onFix={fix} onIgnore={resolve} onSendAnyway={sendAnyway} />
      </div>
    </div>
  );
}
