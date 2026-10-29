import "server-only";
import { palette } from "@/config/brand";
import { cardCopy as copy } from "@/content/app/safe-send";

// The email a Safe Send recipient receives: a card with a private link, never the message itself,
// so withdrawing really works. Table layout and inline styles, because email clients ignore CSS files.

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

const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export function buildCard({ senderName, subject, link, others }: CardInput): { html: string; text: string } {
  const href = escapeHtml(link);
  const alsoTo = others.length ? escapeHtml(copy.alsoTo(others.join(", "))) : "";

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:${palette.warmWhite}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${palette.warmWhite};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${palette.white};border-radius:20px;border:1px solid ${palette.line}">
<tr><td style="padding:32px 32px 8px;${font}">
<p style="margin:0;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${palette.brand};font-weight:600">${escapeHtml(copy.brand)}</p>
<h1 style="margin:16px 0 0;font-size:22px;line-height:1.3;color:${palette.navy}">${escapeHtml(copy.heading(senderName))}</h1>
<p style="margin:10px 0 0;font-size:16px;line-height:1.5;color:${palette.body};font-weight:600">${escapeHtml(subject)}</p>
</td></tr>
<tr><td style="padding:24px 32px;${font}">
<a href="${href}" style="display:inline-block;background:${palette.brand};color:${palette.white};text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:12px">${escapeHtml(copy.button)}</a>
</td></tr>
<tr><td style="padding:0 32px 28px;${font};font-size:13px;line-height:1.6;color:${palette.muted}">
<p style="margin:0">${escapeHtml(copy.privateNote)}<br>${escapeHtml(copy.windowNote(senderName))}</p>
${alsoTo ? `<p style="margin:10px 0 0">${alsoTo}</p>` : ""}
</td></tr>
</table>
<p style="margin:18px 0 0;${font};font-size:12px;color:${palette.subtle}"><a href="${copy.footerUrl}" style="color:${palette.subtle}">${escapeHtml(copy.footer)}</a></p>
</td></tr></table>
</body></html>`;

  const text = [
    copy.textIntro(senderName, subject),
    "",
    copy.textLink(link),
    "",
    copy.privateNote,
    copy.windowNote(senderName),
    ...(others.length ? ["", copy.alsoTo(others.join(", "))] : []),
    "",
    `${copy.footer} ${copy.footerUrl}`,
  ].join("\n");

  return { html, text };
}
