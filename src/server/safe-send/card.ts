import "server-only";
import { palette } from "@/config/brand";
import { cardCopy as copy } from "@/content/app/safe-send";

// The email a Safe Send recipient receives: a private link, never the message itself, so
// withdrawing really works. Deliberately plain, like a note the sender typed: no banner, no button,
// the link address shown in full (link text that hides its address is a phishing signal).

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

const p = `margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:${palette.body}`;

export function buildCard({ senderName, subject, link, others }: CardInput): { html: string; text: string } {
  const href = escapeHtml(link);

  const html = `<!doctype html><html><body style="margin:0;padding:16px">
<p style="${p}">${escapeHtml(copy.greeting)}</p>
<p style="${p}">${escapeHtml(copy.intro(subject))} ${escapeHtml(copy.readHere)}<br><a href="${href}" style="color:${palette.brand};word-break:break-all">${href}</a></p>
<p style="${p}">${escapeHtml(copy.windowNote)}</p>
${others.length ? `<p style="${p}">${escapeHtml(copy.alsoTo(others.join(", ")))}</p>` : ""}
<p style="${p}">${escapeHtml(senderName)}</p>
<p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${palette.subtle}">${escapeHtml(copy.footer)}</p>
</body></html>`;

  const text = [
    copy.greeting,
    `${copy.intro(subject)} ${copy.readHere}\n${link}`,
    copy.windowNote,
    ...(others.length ? [copy.alsoTo(others.join(", "))] : []),
    senderName,
    copy.footer,
  ].join("\n\n");

  return { html, text };
}
