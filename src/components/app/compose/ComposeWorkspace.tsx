"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { composeCopy as copy } from "@/content/app/compose";
import { applyFix } from "@/lib/check/apply-fix";
import type { Finding } from "@/lib/check/types";
import { ClintonPanel } from "./ClintonPanel";
import { ComposeFields, type DraftFields, type FieldErrors } from "./ComposeFields";
import { ComposeFooter } from "./ComposeFooter";
import { ComposeHeader } from "./ComposeHeader";
import { SentToast } from "./SentToast";
import { useComposeCheck } from "./useComposeCheck";
import { DRAFT_HANDOFF_KEY, useSendEmail } from "./useSendEmail";
import { emptyDraft, handedOverDraft, toDraft, toFields, validateFields } from "./validate";

type Props = { fromEmail: string; defaultDelaySeconds: number };

/** Compose with Clinton beside it: write, press Check & send, review, send, and Undo if needed. */
export function ComposeWorkspace({ fromEmail, defaultDelaySeconds }: Props) {
  const [values, setValues] = useState(handedOverDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showCc, setShowCc] = useState(() => values.cc !== "");
  const [delaySeconds, setDelaySeconds] = useState(defaultDelaySeconds);
  const [fixed, setFixed] = useState(0);
  const [safeSend, setSafeSend] = useState(false);
  const { state, flagged, check, resolve, sendAnyway, markEdited, checkHistory, reset } = useComposeCheck();
  const sender = useSendEmail();
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

  /** A fresh Compose: after sending (empty), or after Undo (the email back, to edit). */
  const startOver = (next: DraftFields = emptyDraft, withSafeSend = false) => {
    setValues(next);
    setErrors({});
    setShowCc(next.cc !== "");
    setFixed(0);
    setSafeSend(withSafeSend);
    setDelaySeconds(defaultDelaySeconds);
    reset();
  };

  const queue = async () => {
    const { checkIds, caught } = checkHistory();
    const options = { delaySeconds, findingsCount: caught, findingsAccepted: Math.min(fixed, caught) };
    if (await sender.send(toDraft(values), { ...options, safeSend, checkIds })) startOver();
  };

  const undo = async () => {
    const draft = await sender.undo();
    if (!draft) return;
    startOver(toFields(draft), draft.safeSend);
    requestAnimationFrame(() => bodyRef.current?.focus());
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const found = validateFields(values, safeSend);
    setErrors(found);
    if (Object.keys(found).length) return;
    const result = await check({ ...toDraft(values), attachments: [] });
    // Nothing to flag: it goes straight to the Outbox; the Smart Delay is the safety net.
    if (result.status === "ready") await queue();
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

  const busy = state.status === "checking" || sender.sending;
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <form
        onSubmit={submit}
        onKeyDown={onKeyDown}
        noValidate
        className="rounded-[28px] border border-line bg-surface shadow-card"
      >
        <ComposeHeader fromEmail={fromEmail} />
        <ComposeFields
          values={values}
          errors={errors}
          showCc={showCc}
          onShowCc={() => setShowCc(true)}
          onChange={change}
          toRef={toRef}
          subjectRef={subjectRef}
          bodyRef={bodyRef}
          flags={{ findings: flagged, onFix: fix, onIgnore: resolve }}
        />
        <ComposeFooter
          busy={busy}
          label={state.status === "checking" ? copy.checking : copy.submit}
          safeSend={safeSend}
          onSafeSend={setSafeSend}
          docked={state.status !== "ready" || state.stale}
        />
      </form>
      <div
        ref={panel}
        className="cl-rise scroll-mt-24 lg:sticky lg:top-24"
        style={{ animationDelay: "120ms" }}
      >
        <ClintonPanel
          state={state}
          safeSend={{ on: safeSend, onEnable: () => setSafeSend(true) }}
          onFix={fix}
          onIgnore={resolve}
          onSendAnyway={() => {
            sendAnyway();
            void queue();
          }}
          send={{
            delaySeconds,
            onDelayChange: setDelaySeconds,
            onSend: () => void queue(),
            sending: sender.sending,
            error: sender.error,
          }}
        />
      </div>
      {sender.sent ? (
        <SentToast
          email={sender.sent}
          onUndo={() => void undo()}
          undoing={sender.undoing}
          error={sender.undoError}
          onDismiss={sender.dismiss}
        />
      ) : null}
    </div>
  );
}
