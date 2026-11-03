import { composeCopy as copy } from "@/content/app/compose";
import { safeSendCopy } from "@/content/app/safe-send";
import type { AttachmentRef, EmailDraft } from "@/types/emails";
import { SAFE_SEND_MAX_RECIPIENTS, invalidAddresses, splitAddresses } from "@/lib/validation/compose";
import type { DraftFields, FieldErrors } from "./ComposeFields";
import { DRAFT_HANDOFF_KEY } from "./useSendEmail";

export const emptyDraft: DraftFields = { to: "", cc: "", bcc: "", subject: "", body: "" };

/** A draft handed over by the Outbox's Edit, if any. Client-only (see ComposeLoader). */
export function handedOverDraft(): EmailDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_HANDOFF_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<EmailDraft>;
    return {
      to: draft.to ?? [],
      cc: draft.cc ?? [],
      bcc: draft.bcc ?? [],
      subject: draft.subject ?? "",
      body: draft.body ?? "",
      attachments: draft.attachments ?? [],
    };
  } catch {
    return null;
  }
}

/** Inline errors for the Compose form, in the words the user sees. */
export function validateFields(values: DraftFields, safeSend = false): FieldErrors {
  const errors: FieldErrors = {};
  const to = splitAddresses(values.to);
  const badTo = invalidAddresses(to);
  if (to.length === 0) errors.to = copy.needRecipient;
  else if (badTo.length) errors.to = copy.invalidAddresses(badTo.join(", "));
  for (const field of ["cc", "bcc"] as const) {
    const bad = invalidAddresses(splitAddresses(values[field]));
    if (bad.length) errors[field] = copy.invalidAddresses(bad.join(", "));
  }
  const everyone = to.length + splitAddresses(values.cc).length + splitAddresses(values.bcc).length;
  if (!errors.to && safeSend && everyone > SAFE_SEND_MAX_RECIPIENTS) errors.to = safeSendCopy.tooMany;
  if (!values.body.trim()) errors.body = copy.needBody;
  return errors;
}

export function toDraft(values: DraftFields, attachments: AttachmentRef[] = []): EmailDraft {
  return {
    to: splitAddresses(values.to),
    cc: splitAddresses(values.cc),
    bcc: splitAddresses(values.bcc),
    subject: values.subject,
    body: values.body,
    attachments,
  };
}

export function toFields(draft: EmailDraft): DraftFields {
  return {
    to: draft.to.join(", "),
    cc: draft.cc.join(", "),
    bcc: draft.bcc.join(", "),
    subject: draft.subject,
    body: draft.body,
  };
}
