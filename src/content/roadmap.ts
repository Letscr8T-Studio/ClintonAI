import { sectionIds } from "./navigation";
import type { SectionCopy } from "./types";

// Public, simplified view of the 9-phase plan in docs/product/roadmap.md. Keep the two in step.

export const roadmapSection: SectionCopy = {
  id: sectionIds.roadmap,
  headingId: "road-h",
  pill: "Roadmap",
  title: "Safety first.",
  accent: "Then everything else.",
  description: "We ship in this order so every new feature sits on top of a send button you can trust.",
};

export const roadmapStages: { when: string; label: string; items: string[]; current?: boolean }[] = [
  {
    when: "Now",
    label: "Live at launch",
    current: true,
    items: [
      "AI check before sending",
      "Smart Delay",
      "Safe Send and Unsend (24 hours)",
      "Your dashboard and read status",
      "Gmail and Google Workspace",
    ],
  },
  {
    when: "Next",
    label: "Coming soon",
    items: [
      "Personalised outreach and follow-ups",
      "Chrome extension inside Gmail",
      "AI writing assistant",
      "Outlook and Microsoft 365",
    ],
  },
  {
    when: "Later",
    label: "On the roadmap",
    items: [
      "Yahoo Mail and your own domain",
      "Priority inbox, reminders and digests",
      "iOS and Android apps",
      "Guardrails API for AI agents",
      "Teams, admin rules and SSO",
    ],
  },
];
