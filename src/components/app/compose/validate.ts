import { composeCopy as copy } from "@/content/app/compose";
import type { EmailDraft } from "@/types/emails";
import { invalidAddresses, splitAddresses } from "@/lib/validation/compose";
import type { DraftFields, FieldErrors } from "./ComposeFields";

/** Inline errors for the Compose form, in the words the user sees. */
export function validateFields(values: DraftFields): FieldErrors {
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
