import type { Cta, NavLink } from "./types";

/**
 * In-page anchor ids. Sections render these ids and every nav link points at them,
 * so renaming one here updates both sides (and a test checks they match).
 */
export const sectionIds = {
  top: "top",
  main: "main",
  product: "product",
  how: "how",
  dashboard: "dashboard",
  outreach: "outreach",
  compare: "compare",
  roadmap: "roadmap",
  faq: "faq",
  join: "join",
} as const;

const anchor = (id: keyof typeof sectionIds) => `#${sectionIds[id]}`;

export const announcement = {
  href: anchor("join"),
  text: "Clinton AI early access opens soon.",
  cta: "Get your invite →",
};

export const mainNav: NavLink[] = [
  { href: anchor("product"), label: "Product" },
  { href: anchor("outreach"), label: "Outreach" },
  { href: anchor("roadmap"), label: "Roadmap" },
  { href: anchor("faq"), label: "FAQ" },
];

export const primaryCta: Cta = { href: anchor("join"), label: "Get early access" };

/** The legal pages; real routes, so they work from any page. */
export const legalLinks: NavLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const footerNav: NavLink[][] = [
  [
    { href: anchor("product"), label: "Product" },
    { href: anchor("dashboard"), label: "Dashboard" },
    { href: anchor("outreach"), label: "Outreach" },
  ],
  [
    { href: anchor("roadmap"), label: "Roadmap" },
    { href: anchor("faq"), label: "FAQ" },
    { href: anchor("join"), label: "Early access" },
  ],
  legalLinks,
];

export { anchor };
