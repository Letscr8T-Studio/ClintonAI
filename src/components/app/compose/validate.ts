import { composeCopy as copy } from "@/content/app/compose";
import { safeSendCopy } from "@/content/app/safe-send";
import type { EmailDraft } from "@/types/emails";
import { SAFE_SEND_MAX_RECIPIENTS, invalidAddresses, splitAddresses } from "@/lib/validation/compose";
import type { DraftFields, FieldErrors } from "./ComposeFields";
import { DRAFT_HANDOFF_KEY } from "./useSendEmail";

export const emptyDraft: DraftFields = { to: "", cc: "", subject: "", body: "" };

/** A draft handed over by the Outbox's Edit, if any. Client-only (see ComposeLoader). */
export function handedOverDraft(): DraftFields {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_HANDOFF_KEY);
    return raw ? toFields(JSON.parse(raw) as EmailDraft) : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

/** Inline errors for the Compose form, in the words the user sees. */
export function validateFields(values: DraftFields, safeSend = false): FieldErrors {
  const errors: FieldErrors = {};
  const to = splitAddresses(values.to);
  const badTo = invalidAddresses(to);
  if (to.length === 0) errors.to = copy.needRecipient;
  else if (badTo.length) errors.to = copy.invalidAddresses(badTo.join(", "));
  const badCc = invalidAddresses(splitAddresses(values.cc));
  if (badCc.length) errors.cc = copy.invalidAddresses(badCc.join(", "));
  const everyone = to.length + splitAddresses(values.cc).length;
  if (!errors.to && safeSend && everyone > SAFE_SEND_MAX_RECIPIENTS) errors.to = safeSendCopy.tooMany;
  if (!values.body.trim()) errors.body = copy.needBody;
  return errors;
}

export function toDraft(values: DraftFields): EmailDraft {
  return {
    to: splitAddresses(values.to),
    cc: splitAddresses(values.cc),
    subject: values.subject,
    body: values.body,
  };
}

export function toFields(draft: EmailDraft): DraftFields {
  return { to: draft.to.join(", "), cc: draft.cc.join(", "), subject: draft.subject, body: draft.body };
}
