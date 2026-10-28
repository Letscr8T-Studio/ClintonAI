import { sectionIds } from "./navigation";

export const joinSection = {
  id: sectionIds.join,
  headingId: "join-h",
  titleStart: "Never write",
  accent: "“please ignore my last email”",
  titleEnd: "again.",
  body: "Early access opens in batches, anywhere in the world. Leave your email and we'll send your invite.",
};

export type StatusCardTone = "brand" | "tint" | "ink";

/** Decorative email status cards beside the form. */
export const joinStatusCards: {
  title: string;
  to: string;
  label: string;
  tone: StatusCardTone;
  tilt: string;
}[] = [
  {
    title: "Pricing deck v2",
    to: "amaka@client.co",
    label: "Withdrawn",
    tone: "brand",
    tilt: "rotate(-2deg)",
  },
  {
    title: "Re: contract terms",
    to: "legal@client.co",
    label: "Sending in 4:12",
    tone: "tint",
    tilt: "rotate(1.5deg) translateX(18px)",
  },
  {
    title: "Q3 proposal, final",
    to: "daniel@northwind.co",
    label: "Opened",
    tone: "ink",
    tilt: "rotate(-1deg)",
  },
];

/** Copy for the waitlist form and its states. */
export const waitlistCopy = {
  storageKey: "clinton-waitlist-email",
  /** Key used before the rename, still read so returning visitors stay recognised. */
  legacyStorageKey: "unsend-waitlist-email",
  label: "Your email",
  placeholder: "you@company.com",
  submit: "Join the waitlist",
  submitting: "Joining…",
  joined: "You're on the list. Want to skip the line?",
  surveyed: "Thanks! You're at the front of the line.",
  surveyCta: "Get priority access",
  errors: {
    invalid: "That email doesn't look right. Try again?",
    network: "Couldn't reach the server. Check your connection and try again.",
    generic: "Something went wrong. Please try again.",
  },
};
