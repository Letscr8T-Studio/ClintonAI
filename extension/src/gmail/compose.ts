import type { DraftEmail } from "@/lib/check/types";
import { readRecipients } from "./recipients";
import { gmail } from "./selectors";
import { editorText, richContent, type RichContent } from "./text";

/** What Clinton AI reads from one Gmail compose window: only that window, never the inbox. */
export type GmailDraft = DraftEmail & {
  bcc: string[];
  /** The signature, apart from the body: the check skips it, sending will add it back. */
  signature: string;
  /** A reply or forward with earlier messages quoted under it (not part of the body). */
  quoted: boolean;
  /** Gmail attachments can't be carried over by the extension (see the phase plan). */
  gmailAttachments: number;
  rich: RichContent;
};

/** Gmail's editor in this compose window (a window can only have one). */
export function composeEditor(compose: Element): Element | null {
  return compose.querySelector(gmail.body);
}

const isPage = (el: Element) => el === document.body || el === document.documentElement;

/**
 * Every open compose window and inline reply. For each editor: the smallest element around it
 * that also holds a Send button, widened until it takes in the subject field too. In real Gmail
 * the recipients and subject sit outside the box holding the editor and Send. Widening stops
 * before it would take in another compose window.
 */
export function findComposeWindows(doc: ParentNode): Element[] {
  const found = new Set<Element>();
  for (const editor of doc.querySelectorAll(gmail.body)) {
    let el = editor.parentElement;
    while (el && !el.querySelector(gmail.send)) el = el.parentElement;
    if (!el || isPage(el)) continue;

    let wide = el;
    while (!wide.querySelector(gmail.subject)) {
      const parent = wide.parentElement;
      if (!parent || isPage(parent) || parent.querySelectorAll(gmail.body).length > 1) break;
      wide = parent;
    }
    found.add(wide.querySelector(gmail.subject) ? wide : el);
  }
  return [...found];
}

export function readCompose(compose: Element): GmailDraft {
  const editor = composeEditor(compose);
  const skip = `${gmail.quoted}, ${gmail.signature}`;
  const subject = compose.querySelector<HTMLInputElement>(gmail.subject)?.value.trim() ?? "";
  const signature = compose.querySelector(gmail.signature);
  return {
    to: readRecipients(compose, "to"),
    cc: readRecipients(compose, "cc"),
    bcc: readRecipients(compose, "bcc"),
    subject,
    body: editor ? editorText(editor, skip) : "",
    attachments: [],
    signature: signature ? editorText(signature) : "",
    quoted: Boolean(editor?.querySelector(gmail.quoted)),
    gmailAttachments: compose.querySelectorAll(gmail.attachment).length,
    rich: editor ? richContent(editor, skip) : { links: false, images: false, formatting: false },
  };
}
