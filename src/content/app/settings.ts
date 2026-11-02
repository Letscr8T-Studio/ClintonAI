// Settings: Smart Delay, the sender name, Gmail, and a plain account of what Clinton keeps.

export const settingsCopy = {
  title: "Settings",
  body: "Change how Clinton holds and sends your email. Changes save as you make them.",
  delay: {
    id: "smart-delay",
    title: "Smart Delay",
    body: "How long a sent email waits in your Outbox before it leaves. You can still change it for any single email when you send it.",
    legend: "Default delay, in minutes",
    caption: "Default",
    saving: "Saving…",
    saved: (minutes: string) => `Saved. New emails wait ${minutes}.`,
    savedOff: "Saved. Smart Delay is off: new emails leave as soon as you send them.",
  },
  name: {
    id: "sender-name",
    title: "Your name",
    body: "The name people see next to your address when Clinton sends for you.",
    label: "Name",
    preview: "Recipients see",
    save: "Save name",
    saving: "Saving…",
    saved: "Saved.",
  },
  gmail: { id: "gmail", title: "Gmail account" },
  privacy: {
    id: "privacy",
    title: "What Clinton keeps",
    items: [
      { label: "Your email text, during the AI check", value: "Never stored" },
      { label: "Emails waiting in your Outbox", value: "Encrypted, deleted when they leave" },
      { label: "Gmail permission", value: "Send only. Can't read your inbox" },
      { label: "Your Gmail access token", value: "Encrypted in a vault. Deleted on disconnect" },
    ],
  },
  saveFailed: "That didn't save. Please try again.",
};
