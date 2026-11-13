import type { ReactNode } from "react";
import { LockIcon, ReplyIcon } from "@/components/ui/app-icons";
import { buttonStyles } from "@/components/ui/Button";
import { ClintonMark } from "@/components/ui/icons";
import { LocalTime } from "@/components/ui/LocalTime";
import { palette } from "@/config/brand";
import { viewCopy as copy } from "@/content/app/safe-send";
import type { SafeSendViewModel } from "@/types/safe-send";
import { replyHref, SafeSendLetter, SenderAvatar } from "./SafeSendLetter";

type NoticeProps = { title: string; sender?: { name: string; email: string }; children: ReactNode };

/** Why the message can't be read. Says who and when where we know (trust rule 2). */
function Notice({ title, sender, children }: NoticeProps) {
  return (
    <section className="cl-rise rounded-[28px] border border-line bg-white px-6 py-12 text-center shadow-mock sm:px-14 sm:py-14">
      {sender ? (
        <SenderAvatar name={sender.name} size="size-14" />
      ) : (
        <span
          aria-hidden="true"
          className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-line-soft"
        >
          <ClintonMark size={26} color={palette.muted} />
        </span>
      )}
      <h1 className="mt-6 mb-0 font-display text-[clamp(24px,3vw,30px)] font-bold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mx-auto mt-3 mb-0 max-w-[420px] leading-relaxed text-muted">{children}</p>
      {sender ? (
        <a href={replyHref(sender.email)} className={`${buttonStyles({ variant: "secondary" })} mt-8`}>
          <ReplyIcon size={17} />
          {copy.reply(sender.name.split(" ")[0])}
        </a>
      ) : null}
    </section>
  );
}

function Message({ view }: { view: SafeSendViewModel }) {
  switch (view.kind) {
    case "readable":
      return <SafeSendLetter view={view} />;
    case "withdrawn":
      return (
        <Notice title={copy.withdrawnTitle} sender={{ name: view.senderName, email: view.senderEmail }}>
          {copy.withdrawnBy(view.senderName)} <LocalTime iso={view.withdrawnAt} />. {copy.withdrawnHelp}
        </Notice>
      );
    case "expired":
      return (
        <Notice title={copy.expiredTitle} sender={{ name: view.senderName, email: view.senderEmail }}>
          {copy.expiredBody}
        </Notice>
      );
    case "unreadable":
      return <Notice title={copy.expiredTitle}>{copy.unreadable}</Notice>;
    default:
      return <Notice title={copy.notFoundTitle}>{copy.notFoundBody}</Notice>;
  }
}

/** What a Safe Send link shows: the message as a private letter, or why it can no longer be read. */
export function RecipientView({ view }: { view: SafeSendViewModel }) {
  return (
    <div className="stage-paper min-h-dvh px-4 py-8 sm:py-14">
      <div className="mx-auto flex max-w-[760px] flex-col gap-7">
        <header className="self-center">
          <p className="m-0 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-body">
            <LockIcon size={15} />
            {copy.privateBadge}
          </p>
        </header>
        <main id="main">
          <Message view={view} />
        </main>
        <footer className="flex flex-col items-center gap-2 pt-2 text-center text-[13px] text-muted">
          <a
            href="https://tryclinton.com"
            className="inline-flex items-center gap-2 text-muted no-underline hover:text-ink"
          >
            {copy.deliveredBy}
            <span
              aria-hidden="true"
              className="inline-flex size-5 items-center justify-center rounded-md bg-brand"
            >
              <ClintonMark size={13} color={palette.white} />
            </span>
            <span className="font-semibold text-ink">Clinton AI</span>
          </a>
          <p className="m-0 max-w-[380px]">
            {copy.pitch}{" "}
            <a href="https://tryclinton.com/?ref=safe-send" className="font-semibold text-brand">
              {copy.pitchLink} &rarr;
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
