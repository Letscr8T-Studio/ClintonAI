import { composeEditor, NOT_WRITTEN, type GmailDraft } from "./compose";
import { gmail } from "./selectors";
import { editorText } from "./text";

/** "Re:", "Fwd:" and their usual translations. */
const THREAD_PREFIX = /^\s*(re|fwd?|aw|wg|tr|rv|sv|vs|r|i|enc|res):/i;

/**
 * A reply or forward. Clinton AI's sending can't keep those in their conversation (or carry the
 * forwarded message) yet, so they go with Gmail's Send. They're still checked.
 */
export function isReplyOrForward(draft: GmailDraft): boolean {
  return draft.quoted || THREAD_PREFIX.test(draft.subject);
}

/** What Clinton AI sends: the body with link addresses kept, then the signature. */
export function textToSend(compose: Element): { body: string; signature: string } {
  const editor = composeEditor(compose);
  const signature = compose.querySelector(gmail.signature);
  return {
    body: editor ? editorText(editor, { skip: NOT_WRITTEN, links: true }) : "",
    signature: signature ? editorText(signature, { links: true }) : "",
  };
}

/** The Gmail account this tab is signed in to, from its title ("Inbox (3) - ada@gmail.com - Gmail"). */
export function gmailTabAccount(doc: Document): string | null {
  const found = doc.title.match(/[^\s<>()]+@[^\s<>()]+\.[a-z]{2,}/gi);
  return found ? found[found.length - 1].toLowerCase() : null;
}

/** Discards Gmail's draft once Clinton AI holds the email, so it can't be sent twice. */
export function discardDraft(compose: Element): boolean {
  const button = compose.querySelector<HTMLElement>(gmail.discard);
  if (!button) return false;
  // Gmail's buttons react to the mouse press, not just click.
  for (const type of ["mousedown", "mouseup", "click"])
    button.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
  return true;
}

/** Longest compose link we hand to Gmail; beyond this the body is copied for the person instead. */
export const MAX_COMPOSE_URL = 7500;

export type ReopenDraft = { to: string[]; cc: string[]; bcc: string[]; subject: string; body: string };

/** A Gmail compose window filled with `draft` (Undo). `account` is the /u/N/ number in Gmail's address. */
export function composeUrl(draft: ReopenDraft, account: string, withBody = true): string {
  const params: [string, string][] = [
    ["view", "cm"],
    ["fs", "1"],
    ["tf", "1"],
    ["to", draft.to.join(",")],
    ["cc", draft.cc.join(",")],
    ["bcc", draft.bcc.join(",")],
    ["su", draft.subject],
    ["body", withBody ? draft.body : ""],
  ];
  // encodeURIComponent, not URLSearchParams: spaces as %20, never "+", which some pages show as is.
  const query = params
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `https://mail.google.com/mail/u/${account}/?${query}`;
}

/** The "/u/N/" account number of this Gmail tab (0 for the first signed-in account). */
export function accountIndex(pathname: string): string {
  return pathname.match(/\/mail\/u\/(\d+)\//)?.[1] ?? "0";
}
