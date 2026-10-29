// The Gmail card: connect, connected, needs reconnecting; test send and disconnect.

import type { ConnectOutcome } from "@/types/accounts";

export const gmailCopy = {
  label: "Gmail",
  connectTitle: "Connect your Gmail",
  connectBody:
    "Clinton AI asks Google for one permission: to send email as you. You'll approve it on Google's own screen.",
  permissions: [
    { allowed: true, text: "Send email from your address" },
    { allowed: false, text: "Read your inbox" },
    { allowed: false, text: "Delete or change your email" },
  ],
  connectButton: "Connect Gmail",
  reconnectButton: "Reconnect Gmail",
  opening: "Opening Google…",
  status: { active: "Connected", revoked: "Needs reconnecting", error: "Needs attention" },
  connectedOn: (date: string) => `Connected ${date}`,
  revokedBody: "Google access was removed, so Clinton can't send. Reconnect to keep going.",
  testTitle: "Send yourself a test",
  testBody: "A short email from your own address to your own inbox. It shows up in Sent, like any email.",
  testButton: "Send test email",
  testing: "Sending…",
  footerNote: "Clinton AI can only send as you. It can't read your inbox.",
  disconnect: "Disconnect",
  disconnectConfirm: "Disconnect this Gmail? Its access token is deleted straight away.",
  disconnectYes: "Yes, disconnect",
  disconnectNo: "Keep it",
  disconnecting: "Disconnecting…",
};

/** The test email itself. Plain text, from the user to themselves. */
export const testEmail = {
  subject: "Clinton AI is connected ✓",
  body: (firstName: string | null) =>
    [
      `Hi ${firstName ?? "there"},`,
      "",
      "This is a test from Clinton AI. It was sent from your own Gmail address, so it also sits in your Sent folder like any email you write.",
      "",
      "You're all set.",
      "",
      "Clinton AI",
      "https://tryclinton.com",
    ].join("\n"),
};

/** `/dashboard?gmail=<outcome>` after the Google round trip. */
export const connectOutcomes: Record<ConnectOutcome, { tone: "success" | "error"; text: string }> = {
  connected: { tone: "success", text: "Gmail connected. Clinton can now send as you." },
  cancelled: { tone: "error", text: "Connecting was cancelled. Gmail isn't connected." },
  missing_scope: {
    tone: "error",
    text: "Clinton AI needs the “Send email on your behalf” permission. Connect again and leave that box ticked.",
  },
  failed: { tone: "error", text: "We couldn't connect Gmail. Please try again." },
};

export function connectOutcome(value: unknown) {
  return typeof value === "string" && Object.hasOwn(connectOutcomes, value)
    ? connectOutcomes[value as ConnectOutcome]
    : null;
}

export const accountMessages = {
  testSent: (email: string) => `Sent. Look in ${email}: it's in your inbox and your Sent folder.`,
  rateLimited: "You've sent a few tests already. Try again in a few minutes.",
  revoked: "Google access was removed. Reconnect Gmail to send.",
  notFound: "That account isn't connected any more.",
  failed: "Gmail didn't accept the test. Please try again.",
  disconnected: "Gmail disconnected. Its access token was deleted.",
  invalid: "Something went wrong. Refresh and try again.",
};
