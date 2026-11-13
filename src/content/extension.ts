// The Chrome extension's copy. Keep the honest-limits wording in step with
// docs/phases/phase-3-chrome-extension.md. No imports: scripts/build-extension.mjs reads this file.

/** The Chrome Web Store name and the description under it (132 characters at most). */
export const extensionManifestCopy = {
  name: "Clinton AI",
  description:
    "Check every email for mistakes right in Gmail, then send it with Smart Delay, Send later or Safe Send.",
} as const;

/** The popup: the window under the toolbar icon. */
export const extensionPopupCopy = {
  loading: "Checking your account…",
  signedOut: {
    title: "Clinton AI, inside Gmail",
    body: "Sign in to tryclinton.com once and Clinton checks your emails right in Gmail's compose window.",
    button: "Sign in to Clinton AI",
  },
  noGmail: {
    title: "One step left: connect Gmail",
    body: "Clinton AI needs permission to send as you. It never reads your inbox.",
    button: "Connect Gmail",
  },
  revoked: {
    title: "Gmail needs reconnecting",
    body: "Google access was removed, so Clinton can't send. Reconnect to keep going.",
    button: "Reconnect Gmail",
  },
  ready: {
    signedInAs: "Signed in as",
    sendsFrom: "Sends from",
    delay: (minutes: number) => (minutes === 0 ? "Smart Delay off" : `Smart Delay ${minutes} min`),
    openGmail: "Open Gmail",
    openApp: "Open Clinton AI",
  },
  offline: {
    title: "Can't reach Clinton AI",
    body: "Check your connection, then try again.",
    button: "Try again",
  },
  privacy: "Clinton AI only sees the email you're writing. Never your inbox.",
} as const;

/** The pill Clinton AI adds next to Send in each Gmail compose window. */
export const composeBarCopy = {
  name: "Clinton AI",
  loading: "Clinton AI…",
  ready: "Clinton AI is on",
  readyHint: "Clinton AI checks this email as you write: only this email, never your inbox.",
  checking: "Checking…",
  checkingLabel: "Clinton AI is checking this email",
  allGood: "All good",
  allGoodLabel: "Clinton AI found nothing to worry about",
  toCheck: (n: number) => (n === 1 ? "1 to check" : `${n} to check`),
  /** The findings panel's own name, for screen readers. */
  panelLabel: "What Clinton AI found",
  signIn: "Sign in to Clinton AI",
  connectGmail: "Connect Gmail to Clinton AI",
  offline: "Clinton AI is offline",
} as const;

/** Development builds only: what was read from a compose window, to check against real Gmail. */
export const composeBarDevCopy = {
  toggle: "Debug",
  heading: "What Clinton AI reads (dev build only)",
  copy: "Copy structure",
  copied: "Copied: paste it to the developer",
  none: "—",
  yes: "yes",
  no: "no",
  labels: {
    to: "To",
    cc: "Cc",
    bcc: "Bcc",
    subject: "Subject",
    body: "Body",
    signature: "Signature",
    quoted: "Quoted reply",
    attachments: "Gmail attachments",
    rich: "Would lose",
  },
} as const;
