// Sample data shown inside the product pillar illustrations. Fictional people and companies only.

export const safetySample = {
  warnings: ["Wrong name: David → Daniel", "No file attached"],
  unsendTime: "23:41:08",
};

export const assistantSample = {
  prompt: "Say yes to Thursday. Keep it short.",
  draft: "Hi Amaka, Thursday at 2pm works for me. See you then.",
};

export type LeadState = "Ready" | "Sent" | "Replied";

export const outreachLeads: { name: string; line: string; state: LeadState }[] = [
  { name: "Tola, Lumen Labs", line: "Loved your post on onboarding…", state: "Ready" },
  { name: "Marcus, Northwind", line: "Saw you just opened in Berlin…", state: "Sent" },
  { name: "Priya, Brightpath", line: "Your pricing page change is smart…", state: "Replied" },
];

export const inboxSample = {
  items: [
    { tag: "Needs reply", text: "Daniel · Contract, final terms", tone: "ink" },
    { tag: "Today", text: "Invoice #0142 is due", tone: "tint" },
  ] as const,
  nudge: { text: "No reply from Amaka in 3 days.", action: "Nudge" },
};

export const agentSample = {
  method: "POST",
  path: "/v1/send",
  status: "held",
  reason: ["price to", "external"],
};

export const teamSample = {
  rule: "Salary files stay inside",
  ruleState: "Rule on",
  members: 4,
  avatarColors: ["#2E4CF6", "#11131A", "#8EA0FF", "#E0A800"],
};
