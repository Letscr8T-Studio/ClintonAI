// The Outbox: waiting emails with their countdown, sent and not-sent history, and failure reasons.

export const outboxCopy = {
  title: "Outbox",
  body: "Emails wait here for your Smart Delay before they leave. Until then, nobody has them.",
  waitingTitle: "Waiting to send",
  waitingEmpty: "Nothing waiting. Emails appear here for a few minutes after you send them.",
  sentTitle: "Sent",
  sentEmpty: "Nothing sent in the last 7 days.",
  notSentTitle: "Not sent",
  leavingIn: "Leaving in",
  leavesAt: (time: string) => `Leaves at ${time}`,
  leaving: "Leaving now…",
  to: (list: string) => `To ${list}`,
  noSubject: "(no subject)",
  sentAt: (time: string) => `Sent ${time}`,
  inGmail: "In your Gmail Sent folder",
  cancelled: "Cancelled",
  failed: "Not sent",
  edit: "Edit",
  cancel: "Cancel",
  sendNow: "Send now",
  working: "One moment…",
  cancelConfirm: "Cancel this email? It won't be sent, and its text is deleted.",
  cancelYes: "Yes, cancel",
  cancelNo: "Keep it",
  compose: "Write an email",
};

/** Why an email could not be sent; stored with the email and shown in the Outbox. */
export const failureReasons = {
  noAccount: "Gmail was disconnected before this email left.",
  revoked: "Google access was removed, so Clinton couldn't send. Reconnect Gmail and write it again.",
  unreadable: "This email couldn't be read back securely, so it wasn't sent.",
  refused: "Gmail refused this email. Check the addresses and try again.",
  temporary: "Gmail was busy. Clinton will try again in a moment.",
  gaveUp: "Gmail kept failing, so Clinton stopped after 3 tries. Write it again when Gmail is back.",
};

export const emailActionErrors = {
  noAccount: "Connect Gmail first.",
  notFound: "This email has already left, or was cancelled.",
  failed: "Something went wrong. Please try again.",
  rateLimited: "Too many emails at once. Wait a minute and try again.",
};
