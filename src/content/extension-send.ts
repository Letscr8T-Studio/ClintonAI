// "Send with Clinton AI" inside Gmail: the options, the honest limits, and the note after sending.
// The option names match Compose on the web (compose-options.ts, safe-send.ts).

export const extensionSendCopy = {
  heading: "Send with Clinton AI",
  allGood: "Clinton found nothing to worry about.",
  when: "When",
  smartDelay: (minutes: number) =>
    minutes === 0 ? "Now (Smart Delay off)" : `After Smart Delay (${minutes} min)`,
  from: (email: string) => `From ${email}`,
  button: "Send with Clinton AI",
  sending: "Sending to your Outbox…",
  gmailStillWorks: "Gmail's own Send works as usual.",
  /** Shown instead of the button when Clinton AI can't send this one. */
  blocked: {
    reply:
      "Replies and forwards go with Gmail's Send for now, so they stay in their conversation. Clinton still checks them.",
    attachments:
      "This email has Gmail attachments, which Clinton AI can't carry over. Use Gmail's Send, or attach the files in Clinton AI's Compose.",
    otherAccount: (tab: string, connected: string) =>
      `This Gmail is ${tab}, but Clinton AI sends from ${connected}. Use Gmail's Send here, or connect ${tab} at tryclinton.com.`,
  },
  plainText: "Sent as plain text: bold, colours and pictures won't come through. Link addresses are kept.",
  /** After sending, in a note at the bottom of Gmail. */
  sent: {
    held: (when: string) => `In your Outbox. It leaves ${when}.`,
    now: "Sent from your Gmail.",
    scheduled: (when: string) => `Scheduled: it leaves ${when}.`,
    safeSend: "With Safe Send: you can withdraw it for 24 hours.",
    undo: "Undo",
    undoing: "Taking it back…",
    undone: "Taken back. It's open again in a new Gmail window.",
    undoneCopied: "Taken back. The text was too long for Gmail's link, so it's copied: paste it in.",
    tooLate: "Too late: it has already left.",
    outbox: "Outbox",
    dismiss: "Dismiss",
    draftKept: "Gmail kept a copy of the draft: delete it so it isn't sent twice.",
  },
} as const;
