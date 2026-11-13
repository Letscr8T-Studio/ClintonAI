// Safe Send: the email card recipients get, the page their link opens, and the sender's controls.
// Trust rule 7: we say "withdrawn" and "can no longer be opened", never "deleted from their inbox".

import { SAFE_SEND_MAX_RECIPIENTS } from "@/lib/validation/compose";

export { SAFE_SEND_MAX_RECIPIENTS };

/**
 * The email each recipient receives. Card only: nothing readable stays in their inbox. It opens
 * with a line in the sender's voice, then one quiet card with a single button, and the full link
 * written out under it: a button that hides where it goes is what phishing filters punish.
 */
export const cardCopy = {
  /** The inbox preview line, before anything else in the email. */
  preheader: (sender: string) => `${sender} sent you a private message.`,
  greeting: "Hi,",
  intro: "I've sent you this privately with Safe Send.",
  sentYou: "sent you a private message",
  noSubject: "A private message",
  privateTo: "Private to you",
  window: "Can be withdrawn for 24 hours",
  button: "Read the message",
  orPaste: "Or paste this link into your browser:",
  alsoTo: (list: string) => `Also sent to ${list}.`,
  footer:
    "Sent with Safe Send by Clinton AI. The message isn't in this email: it opens privately in your browser, and the sender can withdraw it for 24 hours.",
  /** Plain-text version, for email apps that don't show HTML. */
  textIntro: (subject: string) =>
    subject
      ? `I've sent you "${subject}" privately with Safe Send. Read it here:`
      : "I've sent you a message privately with Safe Send. Read it here:",
  textWindow: "It's private to you, and I can withdraw it for 24 hours.",
  textFooter: "Sent with Safe Send by Clinton AI · tryclinton.com",
};

/** The page a link opens: /m/<token>. */
export const viewCopy = {
  title: "Private message",
  privateBadge: "Private message",
  to: "To",
  /** "Private to you · Ada can withdraw this until 18:05" (the time follows). */
  window: (sender: string) => `Private to you · ${sender} can withdraw this until`,
  timeLeft: "Time left to read",
  reply: (sender: string) => `Reply to ${sender}`,
  withdrawnTitle: "This message was withdrawn",
  /** Followed by the time, in the reader's own time zone. */
  withdrawnBy: (sender: string) => `${sender} withdrew it on`,
  withdrawnHelp: "If you still need it, you can reply and ask.",
  expiredTitle: "This message has expired",
  expiredBody: "Safe Send messages can be read for 24 hours. This one can no longer be opened.",
  notFoundTitle: "This link isn't valid",
  notFoundBody: "Check that you copied the whole link from the email.",
  unreadable: "This message couldn't be opened. Ask the sender to send it again.",
  deliveredBy: "Delivered privately by",
  pitch: "Clinton AI checks your emails before they go and lets you take them back.",
  pitchLink: "Try it free",
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
