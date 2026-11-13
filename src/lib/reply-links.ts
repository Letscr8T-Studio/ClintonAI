// Ways to reply to a Safe Send sender from the reading page. A mailto: link opens whatever app the
// device has as its default (often none on a computer, or an unused one on a phone), so offer the
// big webmail apps directly, the one the message was sent to first.

export type ReplyApp = "gmail" | "outlook" | "yahoo" | "mailto";
export type ReplyOption = { app: ReplyApp; href: string };

const CONSUMER_OUTLOOK = /@(outlook|hotmail|live|msn)\.[a-z.]+$/i;

/** The webmail the recipient's address most likely uses, or null for a custom domain. */
export function guessApp(recipient: string | undefined): ReplyApp | null {
  if (!recipient) return null;
  if (/@(gmail|googlemail)\.com$/i.test(recipient)) return "gmail";
  if (CONSUMER_OUTLOOK.test(recipient)) return "outlook";
  if (/@(yahoo|ymail|rocketmail)\.[a-z.]+$/i.test(recipient)) return "yahoo";
  return null;
}

const q = encodeURIComponent;

/**
 * Every way to reply to `to`, addressed and with "Re: subject". The guessed app comes first.
 * `recipient` picks the right Google account when several are signed in, and the right Outlook.
 */
export function replyOptions(to: string, subject = "", recipient?: string): ReplyOption[] {
  const re = subject ? `Re: ${subject}` : "";
  const outlookHost =
    recipient && !CONSUMER_OUTLOOK.test(recipient) ? "outlook.office.com" : "outlook.live.com";
  const options: ReplyOption[] = [
    {
      app: "gmail",
      href: `https://mail.google.com/mail/?${recipient ? `authuser=${q(recipient)}&` : ""}view=cm&fs=1&to=${q(to)}${re ? `&su=${q(re)}` : ""}`,
    },
    {
      app: "outlook",
      href: `https://${outlookHost}/mail/deeplink/compose?to=${q(to)}${re ? `&subject=${q(re)}` : ""}`,
    },
    { app: "yahoo", href: `https://compose.mail.yahoo.com/?to=${q(to)}${re ? `&subject=${q(re)}` : ""}` },
    { app: "mailto", href: `mailto:${to}${re ? `?subject=${q(re)}` : ""}` },
  ];
  const first = guessApp(recipient);
  return first
    ? [...options.filter((o) => o.app === first), ...options.filter((o) => o.app !== first)]
    : options;
}
