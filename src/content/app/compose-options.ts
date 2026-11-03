// Compose's extras: Bcc, attachments, Send later, "Likely opened" and Rewrite with Clinton.

export const recipientsCopy = {
  bcc: "Bcc",
  addCc: "Cc",
  addCcLabel: "Add Cc",
  addBcc: "Bcc",
  addBccLabel: "Add Bcc",
  bccHint: "Hidden from everyone else",
};

export const attachCopy = {
  button: "Attach",
  label: "Attach files",
  dropHint: "Drop files to attach them",
  listLabel: "Attachments",
  uploading: "Uploading…",
  remove: (name: string) => `Remove ${name}`,
  failed: "Didn't upload. Remove it and try again.",
  tooBig: "Attachments can be up to 18 MB in total.",
  tooMany: "Up to 10 files per email.",
  stillUploading: "Wait a moment: the attachments are still uploading.",
  noSafeSend: "Safe Send can't carry attachments yet. Remove them or turn Safe Send off.",
};

export const scheduleCopy = {
  button: "Send later",
  title: "Send later",
  body: "It waits in your Outbox until then. You can edit or cancel it any time before.",
  laterToday: "Later today",
  tomorrowMorning: "Tomorrow morning",
  tomorrowAfternoon: "Tomorrow afternoon",
  monday: "Monday morning",
  custom: "Pick a date and time",
  customLabel: "Date and time",
  set: "Schedule",
  chip: (when: string) => `Sends ${when}`,
  clear: "Don't schedule",
  submit: "Check & schedule",
};

export const trackCopy = {
  toggle: "Likely opened",
  help: "Adds a tiny image to see if it was probably opened. A guess: some apps load images for everyone, others block them.",
  safeSendNote: "Safe Send already shows who opened it.",
};

/** "Rewrite with Clinton": one tap to fix, shorten or change the tone. Always undoable. */
export const rewriteCopy = {
  button: "Rewrite",
  label: "Rewrite with Clinton",
  menuLabel: "How should Clinton rewrite it?",
  modes: {
    fix: { label: "Fix spelling & grammar", hint: "Same words, no mistakes" },
    shorter: { label: "Make it shorter", hint: "Same point, fewer words" },
    friendlier: { label: "Make it friendlier", hint: "Warmer, still professional" },
    formal: { label: "Make it more formal", hint: "For clients and seniors" },
  },
  working: "Rewriting…",
  done: (mode: string) => `Clinton rewrote it: ${mode.toLowerCase()}.`,
  undo: "Undo",
  undone: "Back to your version.",
  needText: "Write something first, then Clinton can rewrite it.",
  rateLimited: "That's a lot of rewrites. Wait a minute and try again.",
  unavailable: "Rewrite isn't available right now.",
  failed: "Clinton couldn't rewrite it this time. Your text is unchanged.",
};
