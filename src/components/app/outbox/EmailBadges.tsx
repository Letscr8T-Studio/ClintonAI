import { PaperclipIcon } from "@/components/ui/app-icons";
import { Chip } from "@/components/ui/Chip";
import { badgeCopy as copy } from "@/content/app/outbox";
import type { OutboxEmail } from "@/types/emails";

/**
 * Small facts about an email, beside its subject: files attached, Send later, and "Likely opened"
 * (only for emails sent with it on; never "Opened": a pixel is a guess).
 */
export function EmailBadges({ email }: { email: OutboxEmail }) {
  const tracked = email.trackOpens && email.status === "sent";
  if (!email.attachments.length && !email.scheduled && !tracked) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {email.attachments.length ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <PaperclipIcon size={13} />
          {copy.files(email.attachments.length)}
        </span>
      ) : null}
      {email.scheduled && email.status === "held" ? (
        <Chip size="xs" tone="outline">
          {copy.scheduled}
        </Chip>
      ) : null}
      {tracked ? (
        <Chip size="xs" tone={email.opensCount > 0 ? "tint" : "neutral"}>
          {email.opensCount > 0 ? copy.likelyOpened : copy.noOpens}
          <span className="sr-only"> ({copy.guess})</span>
        </Chip>
      ) : null}
    </span>
  );
}
