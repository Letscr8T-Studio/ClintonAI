// Legal pages: typed content, rendered by LegalPage. Plain words, matching what the product does.

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalDoc = {
  title: string;
  /** "3 November 2026": bump whenever the meaning changes. */
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/**
 * Who is behind Clinton AI and how to reach them. CONFIRM BEFORE LAUNCH: the legal entity name,
 * its country, and that these mailboxes exist and are read.
 */
export const legalEntity = {
  name: "Clinton AI",
  operator: "Letscr8T Studio",
  country: "Nigeria",
  privacyEmail: "privacy@tryclinton.com",
  supportEmail: "support@tryclinton.com",
} as const;
