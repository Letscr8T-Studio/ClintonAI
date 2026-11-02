// Home dashboard: the four numbers, recent emails, what Clinton caught, and the activity history.
// Trust rule 7: Safe Send is "withdrawn", never "deleted from their inbox".

import type { ActivityAction } from "@/types/database";

export const DASHBOARD_DAYS = 30;

export const statsCopy = {
  title: "Your last 30 days",
  sent: { label: "Emails sent", note: "From your own Gmail" },
  caught: {
    label: "Mistakes caught",
    note: (fixed: number) => (fixed === 1 ? "1 fixed before sending" : `${fixed} fixed before sending`),
    meter: (fixed: number, caught: number) => `${fixed} of ${caught} fixed`,
  },
  opens: {
    label: "Safe Send opened",
    note: (people: number) =>
      people === 1 ? "of 1 person (approximate)" : `of ${people} people (approximate)`,
    none: "No Safe Send emails yet",
    meter: (opened: number, people: number) => `${opened} of ${people} people opened it`,
  },
  unsend: {
    label: "You can still unsend",
    note: (waiting: number, safeSend: number) => `${waiting} waiting · ${safeSend} Safe Send`,
    none: "Everything has left",
  },
};

export const recentCopy = {
  title: "Recent emails",
  link: "Open the Outbox",
  empty: "No emails in the last 30 days.",
  caption: "Your most recent emails, their status, and how long you can still take them back.",
  columns: { email: "Email", status: "Status", unsend: "Take back", when: "When" },
  noSubject: "(no subject)",
  to: (list: string) => `To ${list}`,
  safeSend: "Safe Send",
  status: {
    waiting: "Waiting",
    sending: "Sending",
    sent: "Sent",
    withdrawable: "Sent",
    withdrawn: "Withdrawn",
    expired: "Sent",
    cancelled: "Cancelled",
    failed: "Not sent",
  },
  window: {
    waiting: (left: string) => `${left} to cancel`,
    withdrawable: (left: string) => `${left} to withdraw`,
    expired: "Safe Send expired",
    none: "Can no longer be taken back",
  },
};

export const caughtCopy = {
  title: "Caught before sending",
  empty: "Nothing caught yet. When Clinton spots a mistake before you send, it shows up here.",
  noSubject: "(no subject)",
  kindsLabel: "What Clinton caught",
  outcome: (fixed: number, caught: number) =>
    fixed === 0 ? "Sent as written" : fixed >= caught ? "All fixed" : `${fixed} of ${caught} fixed`,
  status: { held: "Waiting", sending: "Sending", sent: "Sent", cancelled: "Cancelled", failed: "Not sent" },
};

const q = (subject: string | null) => `“${subject || "(no subject)"}”`;

export const activityCopy = {
  title: "Activity",
  empty: "Your history starts with your first email.",
  /** `subject` is null when the email itself is gone (Gmail account removed). */
  describe(action: ActivityAction, subject: string | null, recipient: string | null): string {
    const s = subject === null ? "an email" : q(subject);
    switch (action) {
      case "held":
        return `Put ${s} in the Outbox`;
      case "edited":
        return `Took ${s} back to edit`;
      case "sent":
        return recipient ? `Sent ${s} to ${recipient}` : `Sent ${s}`;
      case "cancelled":
        return `Cancelled ${s}`;
      case "failed":
        return `${s} couldn't be sent`;
      case "withdrawn":
        return recipient ? `Withdrew ${s} for ${recipient}` : `Withdrew ${s} for everyone`;
      case "expired":
        return `${s} expired, and its content was deleted`;
      case "opened":
        return recipient ? `${recipient} opened ${s}` : `${s} was opened`;
    }
  },
};
