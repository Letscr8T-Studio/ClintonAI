"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { composeCopy as copy } from "@/content/app/compose";
import { applyFix } from "@/lib/check/apply-fix";
import type { Finding } from "@/lib/check/types";
import type { EmailDraft } from "@/types/emails";
import { ClintonPanel } from "./ClintonPanel";
import { ComposeFields, type DraftFields, type FieldErrors } from "./ComposeFields";
import { ComposeFooter } from "./ComposeFooter";
import { useComposeCheck } from "./useComposeCheck";
import { DRAFT_HANDOFF_KEY, useSendEmail } from "./useSendEmail";
import { toDraft, toFields, validateFields } from "./validate";

const empty: DraftFields = { to: "", cc: "", subject: "", body: "" };

/** A draft handed over by the Outbox's Edit, if any. Client-only (see ComposeLoader). */
function handedOverDraft(): DraftFields {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_HANDOFF_KEY);
    return raw ? toFields(JSON.parse(raw) as EmailDraft) : empty;
  } catch {
    return empty;
  }
}

type Props = { fromEmail: string; defaultDelaySeconds: number };

/** Compose with Clinton beside it: write, press Check & send, review, and send to the Outbox. */
export function ComposeWorkspace({ fromEmail, defaultDelaySeconds }: Props) {
  const [values, setValues] = useState(handedOverDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showCc, setShowCc] = useState(() => values.cc !== "");
  const [delaySeconds, setDelaySeconds] = useState(defaultDelaySeconds);
  const [fixed, setFixed] = useState(0);
  const { state, check, resolve, sendAnyway, markEdited } = useComposeCheck();
  const { send, sending, error } = useSendEmail();
  const toRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // The hand-off is read once; clear it so it doesn't come back on the next visit.
  useEffect(() => window.sessionStorage.removeItem(DRAFT_HANDOFF_KEY), []);

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

  const queue = (findingsCount: number) =>
    send(toDraft(values), { delaySeconds, findingsCount, findingsAccepted: fixed });

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const found = validateFields(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    const result = await check({ ...toDraft(values), attachments: [] });
    // Nothing to flag: it goes straight to the Outbox; the Smart Delay is the safety net.
    if (result.status === "ready") await queue(0);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void submit();
  };

  /** Fix it applies Clinton's suggestion and selects it; Show me jumps to the words. */
  const fix = (finding: Finding) => {
    resolve(finding.id);
    const el = { to: toRef, subject: subjectRef, body: bodyRef }[finding.field].current;
    const result = applyFix(values[finding.field], finding);
    const select = () => {
      el?.focus();
      if (result.start >= 0) el?.setSelectionRange(result.start, result.start + result.length);
    };
    if (!result.changed) return select();
    // Applying Clinton's own fix is not a user edit, so the check result stays current.
    setValues((v) => ({ ...v, [finding.field]: result.value }));
    setFixed((n) => n + 1);
    requestAnimationFrame(select);
  };

  const busy = state.status === "checking" || sending;
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
        <ComposeFooter busy={busy} label={state.status === "checking" ? copy.checking : copy.submit} />
      </form>
      <div
        ref={panel}
        className="cl-rise scroll-mt-24 lg:sticky lg:top-24"
        style={{ animationDelay: "120ms" }}
      >
        <ClintonPanel
          state={state}
          onFix={fix}
          onIgnore={resolve}
          onSendAnyway={() => {
            sendAnyway();
            void queue(state.findings.length);
          }}
          send={{
            delaySeconds,
            onDelayChange: setDelaySeconds,
            onSend: () => void queue(state.findings.length),
            sending,
            error,
          }}
        />
      </div>
    </div>
  );
}
