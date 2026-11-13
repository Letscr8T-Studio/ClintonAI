import "server-only";
import { palette } from "@/config/brand";
import { cardCopy as copy } from "@/content/app/safe-send";

// The Safe Send card's HTML. Email clients are not browsers: tables for layout, every style inline,
// no images (blocked by default and a spam signal), no web fonts, and a button that is a styled
// link inside a table cell so Outlook draws it too. Every value passed in is already escaped.

export type CardParts = {
  sender: string;
  initials: string;
  subject: string;
  href: string;
  others: string | null;
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const text = (size: number, color: string, extra = "") =>
  `font-family:${FONT};font-size:${size}px;line-height:1.55;color:${color};${extra}`;

/** Hidden inbox preview, padded so the email's first words don't follow it into the preview. */
const preheader = (sender: string) =>
  `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${copy.preheader(sender)}${"&#8199;&#65279;&#847;".repeat(40)}</div>`;

const button = (href: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0">
  <tr><td bgcolor="${palette.brand}" style="border-radius:999px">
    <a href="${href}" style="display:inline-block;padding:12px 24px;${text(15, palette.white, "font-weight:600;text-decoration:none;border-radius:999px")}">${copy.button} &rarr;</a>
  </td></tr>
</table>`;

export function cardHtml({ sender, initials, subject, href, others }: CardParts): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:${palette.warmWhite}">
${preheader(sender)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${palette.warmWhite}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">
  <tr><td style="padding:0 4px 18px;${text(15, palette.body)}">${copy.greeting}<br>${copy.intro}</td></tr>
  <tr><td bgcolor="${palette.white}" style="border:1px solid ${palette.line};border-radius:18px;padding:28px 28px 26px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="40" height="40" align="center" valign="middle" bgcolor="${palette.brand}" style="width:40px;height:40px;border-radius:20px;${text(15, palette.white, "font-weight:700;line-height:40px")}">${initials}</td>
      <td style="padding-left:12px;${text(14, palette.muted, "line-height:1.35")}"><strong style="color:${palette.navy};font-size:15px">${sender}</strong><br>${copy.sentYou}</td>
    </tr></table>
    <p style="margin:22px 0 0;${text(20, palette.navy, "font-weight:700;line-height:1.3;letter-spacing:-0.2px")}">${subject}</p>
    <p style="margin:8px 0 0;${text(13, palette.muted)}">${copy.privateTo} &middot; ${copy.window}</p>
    ${button(href)}
    <p style="margin:22px 0 0;padding-top:18px;border-top:1px solid ${palette.line};${text(12, palette.subtle)}">${copy.orPaste}<br><a href="${href}" style="color:${palette.brand};word-break:break-all">${href}</a></p>
  </td></tr>
  ${others ? `<tr><td style="padding:16px 4px 0;${text(13, palette.muted)}">${others}</td></tr>` : ""}
  <tr><td style="padding:22px 4px 0;${text(12, palette.subtle)}">${copy.footer}<br><a href="https://tryclinton.com" style="color:${palette.subtle}">tryclinton.com</a></td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
