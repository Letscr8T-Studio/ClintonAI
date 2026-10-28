import type { Availability } from "./types";

export const inboxes = {
  label: "Which inboxes Clinton AI works with",
  intro: "Send from your own address. The people you email can use any inbox and don't need anything.",
  statusLabels: { live: "At launch", soon: "Soon" } satisfies Record<Availability, string>,
  // Text chips for now. Before using official logos, check each brand's "works with" guidelines.
  providers: [
    { name: "Gmail", status: "live" },
    { name: "Google Workspace", status: "live" },
    { name: "Outlook", status: "soon" },
    { name: "Microsoft 365", status: "soon" },
    { name: "Yahoo Mail", status: "soon" },
    { name: "Own domain", status: "soon" },
  ] satisfies { name: string; status: Availability }[],
};
