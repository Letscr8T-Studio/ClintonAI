// Shared shapes for marketing content. Components render these; they never hard-code copy.

/** Whether a feature ships in Phase 1 ("live") or later ("soon"). */
export type Availability = "live" | "soon";

export type NavLink = { href: string; label: string };

export type Cta = { href: string; label: string };

export type SectionCopy = {
  id: string;
  headingId: string;
  pill: string;
  title: string;
  accent?: string;
  description?: string;
};

export type FaqItem = { question: string; answer: string };
