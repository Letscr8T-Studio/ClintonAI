import { anchor, primaryCta } from "./navigation";

export const hero = {
  headingId: "hero-h",
  badge: "Meet Clinton, your AI for email",
  title: "Email that thinks",
  accent: "before you send.",
  body: "Clinton AI checks every email for mistakes, holds it while you think, and lets you take it back for 24 hours, even after it's opened. Soon it will write, personalise and follow up for you too.",
  primaryCta,
  secondaryCta: { href: anchor("product"), label: "See everything it does" },
  reassurance: "Free during early access · Sends from your own inbox · Recipients install nothing",
};

/** The two decorative cards floating beside the hero on wide screens. */
export const heroCards = {
  unsend: {
    title: "Unsend window",
    status: "Opened",
    time: "23:41:08",
    progress: 92,
    caption: "left to take it back",
  },
  aiCheck: {
    title: "Clinton caught this",
    before: "You said",
    highlight: "attached",
    after: ", but nothing is attached.",
    fix: "Fix it",
    ignore: "Send anyway",
  },
};
