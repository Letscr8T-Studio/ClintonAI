import { LocalTime } from "@/components/ui/LocalTime";
import { viewCopy as copy } from "@/content/app/safe-send";
import { initialsOf } from "@/lib/initials";
import { linkify } from "@/lib/linkify";
import type { SafeSendViewModel } from "@/types/safe-send";
import { ReplyMenu } from "./ReplyMenu";
import { WindowStrip } from "./WindowStrip";

type Readable = Extract<SafeSendViewModel, { kind: "readable" }>;

/** The sender's initials in a round brand tile: the face of the message. */
export function SenderAvatar({ name, size = "size-12" }: { name: string; size?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-display text-[15px] font-bold text-white`}
    >
      {initialsOf(name)}
    </span>
  );
}

/**
 * A Safe Send message as a letter: who it's from, the subject as its headline, the text in
 * comfortable reading type (links clickable, never HTML), ways to reply, and until when it can
 * be withdrawn.
 */
export function SafeSendLetter({ view }: { view: Readable }) {
  return (
    <article className="cl-rise rounded-[28px] border border-line bg-white shadow-mock">
      <div className="px-6 pt-8 pb-9 sm:px-12 sm:pt-11">
        <header>
          <div className="flex items-center gap-3.5">
            <SenderAvatar name={view.senderName} />
            <p className="m-0 min-w-0 flex-1 leading-tight">
              <span className="block text-[16px] font-semibold text-ink">{view.senderName}</span>
              <span className="block truncate text-[14px] text-muted">{view.senderEmail}</span>
            </p>
            {view.sentAt ? (
              <span className="hidden shrink-0 text-[13px] text-muted sm:block">
                <LocalTime iso={view.sentAt} />
              </span>
            ) : null}
          </div>
          <h1 className="mt-8 mb-0 font-display text-[clamp(26px,3.6vw,36px)] leading-[1.15] font-bold tracking-[-0.025em] break-words text-ink">
            {view.subject || copy.noSubject}
          </h1>
          <p className="mt-3 mb-0 text-[14px] text-muted">
            {copy.to} {view.recipientEmail}
            {view.sentAt ? (
              <span className="sm:hidden">
                {" · "}
                <LocalTime iso={view.sentAt} />
              </span>
            ) : null}
          </p>
        </header>
        <div className="mt-8 border-t border-line pt-8 text-[17px] leading-[1.75] break-words whitespace-pre-wrap text-body">
          {linkify(view.body).map((piece, i) =>
            piece.href ? (
              <a
                key={i}
                href={piece.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
              >
                {piece.text}
              </a>
            ) : (
              piece.text
            ),
          )}
        </div>
        <div className="mt-10">
          <ReplyMenu
            to={view.senderEmail}
            senderName={view.senderName}
            subject={view.subject}
            recipient={view.recipientEmail}
          />
        </div>
      </div>
      <WindowStrip sender={view.senderName.split(" ")[0]} sentAt={view.sentAt} expiresAt={view.expiresAt} />
    </article>
  );
}
