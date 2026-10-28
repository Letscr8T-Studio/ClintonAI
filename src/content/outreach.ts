import { sectionIds } from "./navigation";

export const outreachSection = {
  id: sectionIds.outreach,
  headingId: "out-h",
  title: "Outreach that sounds like",
  accent: "you wrote each one.",
  body: "Bring your own leads. Clinton writes a personal email for each one, you approve them, and they go out from your own inbox with follow-ups that stop the moment someone replies.",
  steps: [
    { title: "Import", detail: "CSV, Apollo or one by one" },
    { title: "Personalise", detail: "A real email for each lead" },
    { title: "Review", detail: "Approve, edit or skip" },
    { title: "Send", detail: "From your inbox, with follow-ups" },
  ],
  compliance: "Unsubscribe link and do-not-contact list built in. Safe daily sending limits.",
};

/** Sample review-queue card for the outreach illustration. */
export const outreachSample = {
  queueLabel: "Review queue · 3 of 40",
  badge: "Personalised",
  recipient: "Priya Shah",
  role: "Head of Growth, Brightpath",
  greeting: "Hi Priya,",
  personalLine: "your new pricing page is smart, the annual toggle especially.",
  rest: "We help teams like yours send outreach that never goes out with a wrong name or a broken merge field…",
  actions: ["Edit", "Skip"],
  primaryAction: "Approve",
  mergeWarning: "Lead 17 says “Hi {first_name}”. Fixed before sending.",
  pipeline: [
    { label: "Sent", value: "120" },
    { label: "Replied", value: "18" },
    { label: "Interested", value: "7" },
    { label: "Meetings", value: "3" },
  ],
};
