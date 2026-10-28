import { sectionIds } from "./navigation";
import type { Availability, SectionCopy } from "./types";

/** Keys of the illustrations in components/marketing/visuals/platform. */
export type PlatformVisual = "safety" | "assistant" | "outreach" | "inbox" | "agent" | "team" | "reach";

export type PlatformPillar = {
  num: string;
  title: string;
  body: string;
  points: string[];
  status: Availability;
  visual: PlatformVisual;
  /** Columns spanned on the 6-column desktop grid. */
  span: 2 | 3 | 4;
  dark?: boolean;
};

export const platformSection: SectionCopy = {
  id: sectionIds.product,
  headingId: "product-h",
  pill: "Everything Clinton does",
  title: "One AI for all your email.",
  accent: "Starting with safety.",
  description:
    "The safety tools are live on day one. The rest is on the way, and early users help decide what comes first.",
};

/** The seven product pillars (docs/product/features.md). */
export const pillars: PlatformPillar[] = [
  {
    num: "01",
    title: "Never send a mistake",
    body: "Clinton checks every email before it leaves, holds it for a few minutes, and lets you take it back for 24 hours, even after it's opened.",
    points: ["AI check", "Smart Delay", "Safe Send", "Unsend", "Read status", "Proof of delivery"],
    status: "live",
    visual: "safety",
    span: 4,
  },
  {
    num: "02",
    title: "Writes with you",
    body: "Draft from a few words, fix the tone, summarise long threads and ask what you're behind on.",
    points: ["Draft", "Rewrite", "Summarise", "Translate"],
    status: "soon",
    visual: "assistant",
    span: 2,
  },
  {
    num: "03",
    title: "Personal outreach at scale",
    body: "Bring your leads. Clinton writes a personal email for each one, you approve, and it sends from your inbox with follow-ups.",
    points: ["Import leads", "Personalise", "Review queue", "Follow-ups", "Reply sorting"],
    status: "soon",
    visual: "outreach",
    span: 3,
  },
  {
    num: "04",
    title: "An inbox that sorts itself",
    body: "Important email first, reminders when someone hasn't replied, and a daily digest of what needs you.",
    points: ["Priority inbox", "Reminders", "Daily digest", "Snooze"],
    status: "soon",
    visual: "inbox",
    span: 3,
  },
  {
    num: "05",
    title: "Guardrails for AI agents",
    body: "Bots and agents send through Clinton. Risky emails are held for a human, with rules and full logs.",
    points: ["Send API", "Review holds", "Rules", "Logs"],
    status: "soon",
    visual: "agent",
    span: 2,
    dark: true,
  },
  {
    num: "06",
    title: "Built for teams",
    body: "Shared templates and brand voice, admin rules like “salary files never leave the company”, and an audit log.",
    points: ["Templates", "Admin rules", "Roles", "SSO"],
    status: "soon",
    visual: "team",
    span: 2,
  },
  {
    num: "07",
    title: "Wherever you write",
    body: "It starts as a web app. Next it comes inside Gmail with the Chrome extension, to more inboxes, and to your phone.",
    points: ["Chrome extension", "Outlook", "Yahoo", "iOS", "Android"],
    status: "soon",
    visual: "reach",
    span: 2,
  },
];
