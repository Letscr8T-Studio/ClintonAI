import { site } from "@/config/site";
import { sectionIds } from "./navigation";

export type SentTone = "open" | "quiet" | "strong";

export const dashboardSection = {
  id: sectionIds.dashboard,
  headingId: "dash-h",
  title: "Know what happened to",
  accent: "every email.",
  body: "Your own dashboard shows what you sent, who opened it, what you can still take back, and what Clinton caught for you.",
  points: [
    "Every email you sent, and what happened to it",
    "Exactly when each Safe Send email was opened",
    "A live countdown and Unsend button for each one",
    "The mistakes Clinton stopped before they went out",
  ],
  footnote:
    "Opens are exact for Safe Send emails. For normal emails they're marked “likely”, and you can turn tracking off.",
};

/** Sample numbers for the dashboard mockup (docs/product/features.md, "User dashboard"). */
export const dashboardSample = {
  label: "Clinton AI dashboard showing sent emails, open status, unsend countdowns and mistakes caught",
  host: site.appHost,
  stats: [
    { label: "Sent this month", value: "142" },
    { label: "Mistakes caught", value: "12", accent: true },
    { label: "Safe Send opened", value: "31/40" },
    { label: "Can still unsend", value: "6" },
  ],
  tableTitle: "Sent emails",
  rows: [
    { to: "Ada", subject: "Invoice for October", status: "Opened 10:42", tone: "open", time: "18h left" },
    { to: "Tunde", subject: "Contract draft", status: "Not opened", tone: "quiet", time: "21h left" },
    { to: "Kemi", subject: "Q3 report", status: "Withdrawn", tone: "strong", time: "Taken back" },
    { to: "Team", subject: "Friday update", status: "In Smart Delay", tone: "quiet", time: "Sends in 0:45" },
  ] satisfies { to: string; subject: string; status: string; tone: SentTone; time: string }[],
  caught: "Caught before sending: “Dear Tolu” in an email to Tunde.",
};
