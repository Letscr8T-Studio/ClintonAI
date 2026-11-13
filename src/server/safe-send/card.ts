import "server-only";
import { cardCopy as copy } from "@/content/app/safe-send";
import { initialsOf } from "@/lib/initials";
import { cardHtml } from "./card-html";

// The email a Safe Send recipient receives: a private link, never the message itself, so
// withdrawing really works. A line in the sender's voice, one quiet card with a single button,
// and the full link written out (link text that hides its address is a phishing signal).

export type CardInput = {
  senderName: string;
  subject: string;
  link: string;
  /** The other people it went to, shown so the recipient knows who else has it. */
  others: string[];
};

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Every user-provided string goes through this before it touches HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c]!);
}

export function buildCard({ senderName, subject, link, others }: CardInput): { html: string; text: string } {
  const alsoTo = others.length ? copy.alsoTo(others.join(", ")) : null;

  const html = cardHtml({
    sender: escapeHtml(senderName),
    initials: escapeHtml(initialsOf(senderName)),
    subject: escapeHtml(subject || copy.noSubject),
    href: escapeHtml(link),
    others: alsoTo ? escapeHtml(alsoTo) : null,
  });

  const text = [
    copy.greeting,
    `${copy.textIntro(subject)}\n${link}`,
    copy.textWindow,
    ...(alsoTo ? [alsoTo] : []),
    senderName,
    copy.textFooter,
  ].join("\n\n");

  return { html, text };
}
