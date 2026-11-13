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
