// Safe Send: the email card recipients get, the page their link opens, and the sender's controls.
// Trust rule 7: we say "withdrawn" and "can no longer be opened", never "deleted from their inbox".

import { SAFE_SEND_MAX_RECIPIENTS } from "@/lib/validation/compose";

export { SAFE_SEND_MAX_RECIPIENTS };

/**
 * The email each recipient receives. Card only: nothing readable stays in their inbox.
 * Written as a short personal note in the sender's voice, with the link address visible: a branded
 * "X sent you a message" banner with one big button reads like phishing and lands in spam.
 */
export const cardCopy = {
  greeting: "Hi,",
  intro: (subject: string) =>
    subject ? `I've sent you "${subject}" with Safe Send.` : "I've sent you a message with Safe Send.",
  readHere: "You can read it here:",
  windowNote: "The link is just for you, and I can withdraw the message for 24 hours after sending it.",
  alsoTo: (list: string) => `Also sent to ${list}.`,
  footer: "Sent with Clinton AI (tryclinton.com)",
};

/** The page a link opens: /m/<token>. */
export const viewCopy = {
  title: "Message",
  from: "From",
  to: "To",
  sent: (when: string) => `Sent ${when}`,
  window: "The sender can withdraw this message until",
  withdrawnTitle: "This message was withdrawn",
  /** Followed by the time, in the reader's own time zone. */
  withdrawnBy: (sender: string) => `${sender} withdrew it on`,
  expiredTitle: "This message has expired",
  expiredBody: "Safe Send messages can be read for 24 hours. This one can no longer be opened.",
  notFoundTitle: "This link isn't valid",
  notFoundBody: "Check that you copied the whole link from the email.",
  unreadable: "This message couldn't be opened. Ask the sender to send it again.",
  footer: "Sent safely with Clinton AI",
  noSubject: "(no subject)",
};

/** The sender's side: Compose toggle and Outbox controls. */
export const safeSendCopy = {
  toggle: "Safe Send",
  toggleHelp:
    "Recipients get a private link instead of your text, so you can withdraw it for 24 hours. The subject line still shows in their inbox.",
  suggest: "This one looks sensitive. Turn on Safe Send so you can take it back for 24 hours.",
  suggestButton: "Turn on Safe Send",
  tooMany: `Safe Send works for up to ${SAFE_SEND_MAX_RECIPIENTS} people.`,
  perPersonNote: "Each person gets their own private link, so Gmail keeps one sent copy per person.",
  label: "Safe Send",
  timeLeft: (time: string) => `${time} left to withdraw`,
  withdrawn: "Withdrawn",
  expired: "Expired: content deleted",
  opened: (n: number) => (n === 1 ? "Opened once" : `Opened ${n} times`),
  notOpened: "Not opened yet",
  opensNote: "Opens are approximate: some email apps open links automatically.",
  withdrawOne: "Withdraw",
  withdrawAll: "Withdraw for everyone",
  withdrawAllConfirm: "Withdraw this message for everyone? Their links will say you withdrew it.",
  withdrawYes: "Yes, withdraw",
  withdrawNo: "Keep it",
  withdrawing: "Withdrawing…",
  partialFailure: (list: string) => `Not delivered to ${list}. Their links were withdrawn.`,
};

export const safeSendErrors = {
  notFound: "This message can no longer be withdrawn.",
  failed: "Something went wrong. Please try again.",
};
