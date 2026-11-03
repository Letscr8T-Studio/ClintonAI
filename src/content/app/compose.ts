// Compose and the AI check: screen copy, finding labels and the wording of every rule finding.

import type { ModelType, RuleHit, RuleType } from "@/lib/check/types";

export const composeCopy = {
  title: "New email",
  close: "Close and go Home",
  from: "From",
  to: "To",
  cc: "Cc",
  addCc: "Add Cc",
  subject: "Subject",
  body: "Message",
  toPlaceholder: "name@company.com, another@company.com",
  bodyPlaceholder: "Write your email…",
  submit: "Check & send",
  checking: "Checking…",
  shortcut: "Ctrl + Enter",
  footer: "Clinton checks every email before anything leaves.",
  noAccountTitle: "Connect Gmail to start writing",
  noAccountBody: "Clinton AI sends from your own address, so it needs your Gmail connected first.",
  invalidAddresses: (list: string) => `Check these addresses: ${list}`,
  needRecipient: "Add at least one recipient.",
  needBody: "Write something first.",
};

export const panelCopy = {
  idleTitle: "Clinton is ready",
  idleBody: "When you press Check & send, Clinton reads your email for the mistakes people regret.",
  watches: [
    "Missing attachments",
    "Wrong names",
    "Wrong dates",
    "Too many recipients",
    "Card numbers & passwords",
    "Placeholders",
    "Tone & contradictions",
  ],
  checkingTitle: "Reading your email…",
  checkingBody: "Rules first, then a closer look.",
  caught: (n: number) => (n === 1 ? "Clinton caught 1 thing" : `Clinton caught ${n} things`),
  fix: "Fix it",
  show: "Show me",
  replace: "Replace",
  with: "with",
  suggested: "Suggested:",
  ignore: "Ignore",
  sendAnyway: "Send anyway",
  readyTitle: "Ready to send",
  readyBody: "Clinton found nothing to worry about.",
  readyAfterReview: "You've reviewed everything Clinton raised.",
  delayLabel: "Smart Delay",
  delayOption: (minutes: string) => `${minutes} min`,
  delayOff: "Off: send now",
  /** Shown instead of delayHint when this email has no Smart Delay. */
  delayOffHint: "It leaves as soon as you press Send. You won't be able to cancel it.",
  delayHint: "It waits in your Outbox first. You can cancel or edit until it leaves.",
  send: "Send",
  sending: "Sending to your Outbox…",
  stale: "You've changed the email since the check. Clinton checks again when you send.",
  modelSkipped: "Quick check only: the deeper AI check didn't respond in time.",
  errorTitle: "Clinton couldn't finish the check",
  errorBody: "Here's what the quick check found. You can always send.",
  rateLimited: "You've run a lot of checks. Wait a minute and try again.",
  close: "Close",
  inlineHint: "Highlighted in your email: tap a word to see Clinton's note.",
  inlineLabel: (label: string) => `Clinton: ${label}`,
  inlineAnnounce: (label: string, message: string) => `${label}. ${message}`,
};

/** The bar that appears after sending, Gmail-style, with Undo while the email still waits. */
export const sentToastCopy = {
  label: "Email sent to your Outbox",
  leavingIn: "Sending in",
  sent: "Sent",
  sentNote: "It's on its way from your Gmail.",
  leavesAt: (time: string) => `In your Outbox. It leaves at ${time}. You can undo until then.`,
  scheduled: (when: string) => `Scheduled: ${when}`,
  scheduledNote: "It waits in your Outbox until then. You can undo or edit it before it leaves.",
  undo: "Undo",
  undoing: "Taking it back…",
  view: "View",
  viewLabel: "View in Outbox",
  dismiss: "Dismiss",
  undone: "Taken back. It's here for you to edit.",
};

/** Short chip label per finding type. */
export const findingLabels: Record<RuleType | ModelType, string> = {
  missing_attachment: "Attachment",
  greeting_mismatch: "Name",
  many_recipients: "Recipients",
  date_mismatch: "Date",
  sensitive_data: "Sensitive",
  placeholder: "Placeholder",
  empty_subject: "Subject",
  tone: "Tone",
  contradiction: "Contradiction",
  timing: "Time passed",
  spelling: "Spelling",
  unfinished: "Unfinished",
  recipient: "Recipient",
  clarity: "Clarity",
  other: "Check",
};

const sensitiveKinds: Record<string, string> = {
  card: "This looks like a card number. Email isn't a safe place for it.",
  password: "This looks like a password. Anyone who sees the email can use it.",
  account: "This includes a bank account number. Make sure it's meant for this person.",
};

/** The sentence shown for a rule finding. Never repeats sensitive data back. */
export function describeHit(hit: RuleHit): string {
  const p = hit.params ?? {};
  switch (hit.type) {
    case "missing_attachment":
      return "You mention an attachment, but nothing is attached.";
    case "greeting_mismatch":
      return `You wrote “${p.name}”, but this is going to ${p.recipient}.`;
    case "many_recipients":
      return `This is going to ${p.count} people. Is that everyone you meant?`;
    case "date_mismatch":
      return `You wrote “${hit.excerpt}”, but ${p.date} is a ${p.actual}.`;
    case "sensitive_data":
      return sensitiveKinds[String(p.kind)] ?? sensitiveKinds.card!;
    case "placeholder":
      return `“${hit.excerpt}” looks like a placeholder you haven't filled in.`;
    case "empty_subject":
      return "There's no subject. Emails without one are easy to miss.";
  }
}
