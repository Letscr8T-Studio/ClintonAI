"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { attachCopy } from "@/content/app/compose-options";
import type { EmailDraft } from "@/types/emails";
import { AttachmentList } from "./AttachmentList";
import { ClintonPanel } from "./ClintonPanel";
import { ComposeFields } from "./ComposeFields";
import { ComposeFooter } from "./ComposeFooter";
import { ComposeHeader } from "./ComposeHeader";
import { ComposeToolbar } from "./ComposeToolbar";
import { SentToast } from "./SentToast";
import { useAttachments } from "./useAttachments";
import { useComposeCheck } from "./useComposeCheck";
import { useDraft } from "./useDraft";
import { useFieldFixes } from "./useFieldFixes";
import { useRewrite } from "./useRewrite";
import { DRAFT_HANDOFF_KEY, useSendEmail } from "./useSendEmail";
import { useSendOptions } from "./useSendOptions";
import { emptyDraft, handedOverDraft, toDraft, toFields, validateFields } from "./validate";

type Props = { fromEmail: string; defaultDelaySeconds: number; defaultTrackOpens?: boolean };

/** Compose with Clinton beside it: write, attach, rewrite, check, send (now or later), Undo. */
export function ComposeWorkspace({ fromEmail, defaultDelaySeconds, defaultTrackOpens = false }: Props) {
  const [handoff] = useState(handedOverDraft);
  const { state, flagged, panelRef, check, resolve, sendAnyway, markEdited, checkHistory, reset } =
    useComposeCheck();
  const draft = useDraft(handoff ? toFields(handoff) : emptyDraft, markEdited);
  const { values, setValues, errors, setErrors } = draft;
  const [fixed, setFixed] = useState(0);
  const options = useSendOptions({ delaySeconds: defaultDelaySeconds, trackOpens: defaultTrackOpens });
  const files = useAttachments(handoff?.attachments);
  const sender = useSendEmail();
  const { fix, toRef, subjectRef, bodyRef } = useFieldFixes({
    values,
    setValues,
    resolve,
    onFixed: () => setFixed((n) => n + 1),
  });

  // The hand-off is read once; clear it so it doesn't come back on the next visit.
  useEffect(() => window.sessionStorage.removeItem(DRAFT_HANDOFF_KEY), []);

  const rewrite = useRewrite(values.body, (text) => draft.change("body", text));

  /** A fresh Compose: after sending (empty), or after Undo (the email back, to edit). */
  const startOver = (next?: EmailDraft & { safeSend: boolean }) => {
    draft.load(next ? toFields(next) : emptyDraft);
    setFixed(0);
    options.reset({ safeSend: next?.safeSend });
    files.reset(next?.attachments);
    reset();
  };

  const queue = async () => {
    const { checkIds, caught } = checkHistory();
    const sent = await sender.send(toDraft(values, files.refs()), {
      delaySeconds: options.delaySeconds,
      sendAt: options.sendAt?.toISOString(),
      safeSend: options.safeSend,
      trackOpens: options.trackOpens,
      findingsCount: caught,
      findingsAccepted: Math.min(fixed, caught),
      checkIds,
    });
    if (sent) startOver();
  };

  const undo = async () => {
    const back = await sender.undo();
    if (!back) return;
    startOver(back);
    requestAnimationFrame(() => bodyRef.current?.focus());
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const found = validateFields(values, options.safeSend);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (files.uploading) return files.notify(attachCopy.stillUploading);
    if (options.safeSend && files.items.length) return files.notify(attachCopy.noSafeSend);
    const email = toDraft(values, files.refs());
    const result = await check({ ...email, attachments: email.attachments.map((a) => a.name) });
    // Nothing to flag: it goes straight to the Outbox; the Smart Delay is the safety net.
    if (result.status === "ready") await queue();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void submit();
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <form
        onSubmit={submit}
        onKeyDown={onKeyDown}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          files.add(Array.from(e.dataTransfer.files));
        }}
        noValidate
        className="rounded-[28px] border border-line bg-surface shadow-card"
      >
        <ComposeHeader fromEmail={fromEmail} />
        <ComposeFields
          values={values}
          errors={errors}
          rows={draft.rows}
          onShowRow={draft.showRow}
          onChange={draft.change}
          toRef={toRef}
          subjectRef={subjectRef}
          bodyRef={bodyRef}
          flags={{ findings: flagged, onFix: fix, onIgnore: resolve }}
        />
        <AttachmentList items={files.items} notice={files.notice} onRemove={files.remove} />
        <ComposeToolbar onAttach={files.add} rewrite={rewrite} />
        <ComposeFooter
          busy={state.status === "checking" || sender.sending}
          checking={state.status === "checking"}
          options={options}
          docked={state.status !== "ready" || state.stale}
        />
      </form>
      <div
        ref={panelRef}
        className="cl-rise scroll-mt-24 lg:sticky lg:top-24"
        style={{ animationDelay: "120ms" }}
      >
        <ClintonPanel
          state={state}
          safeSend={{ on: options.safeSend, onEnable: () => options.setSafeSend(true) }}
          onFix={fix}
          onIgnore={resolve}
          onSendAnyway={() => {
            sendAnyway();
            void queue();
          }}
          send={{
            delaySeconds: options.delaySeconds,
            onDelayChange: options.setDelaySeconds,
            scheduledFor: options.sendAt,
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
