import type { ReactNode } from "react";
import { ClintonMark } from "@/components/ui/icons";
import { LocalTime } from "@/components/ui/LocalTime";
import { Logo } from "@/components/ui/Logo";
import { palette } from "@/config/brand";
import { viewCopy as copy } from "@/content/app/safe-send";
import type { SafeSendViewModel } from "@/types/safe-send";

const card = "cl-rise overflow-hidden rounded-[28px] border border-line bg-white shadow-mock";

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={`${card} px-6 py-12 text-center sm:px-12`}>
      <span
        aria-hidden="true"
        className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-line-soft"
      >
        <ClintonMark size={26} color={palette.muted} />
      </span>
      <h1 className="mt-5 mb-0 font-display text-[clamp(24px,3vw,30px)] font-bold tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 mb-0 max-w-[420px] text-muted">{children}</p>
    </section>
  );
}

/** What a Safe Send link shows: the message, or why it can no longer be read (trust rule 2). */
export function RecipientView({ view }: { view: SafeSendViewModel }) {
  return (
    <div className="stage-paper min-h-dvh px-4 py-8 sm:py-14">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <header className="self-center">
          <Logo href="https://tryclinton.com" />
        </header>
        <main id="main">
          {view.kind === "readable" ? (
            <article className={card}>
              <header className="border-b border-line px-6 pt-7 pb-5 sm:px-10">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand font-display font-bold text-white"
                  >
                    {view.senderName.charAt(0).toUpperCase()}
                  </span>
                  <p className="m-0 min-w-0 text-sm leading-tight">
                    <span className="block font-semibold text-ink">{view.senderName}</span>
                    <span className="block truncate text-muted">{view.senderEmail}</span>
                  </p>
                </div>
                <h1 className="mt-5 mb-0 font-display text-[clamp(22px,3vw,30px)] leading-tight font-bold tracking-tight break-words">
                  {view.subject || copy.noSubject}
                </h1>
                <p className="mt-2 mb-0 text-sm text-muted">
                  {copy.to} {view.recipientEmail}
                  {view.sentAt ? (
                    <>
                      {" · "}
                      <LocalTime iso={view.sentAt} />
                    </>
                  ) : null}
                </p>
              </header>
              <div className="px-6 py-7 text-[16px] leading-relaxed break-words whitespace-pre-wrap text-ink sm:px-10">
                {view.body}
              </div>
              <footer className="flex items-center gap-2.5 bg-brand-wash px-6 py-4 text-sm text-brand-deep sm:px-10">
                <ClintonMark size={16} color={palette.brand} />
                <span>
                  {copy.window} <LocalTime iso={view.expiresAt} />.
                </span>
              </footer>
            </article>
          ) : view.kind === "withdrawn" ? (
            <Notice title={copy.withdrawnTitle}>
              {copy.withdrawnBy(view.senderName)} <LocalTime iso={view.withdrawnAt} />.
            </Notice>
          ) : view.kind === "expired" ? (
            <Notice title={copy.expiredTitle}>{copy.expiredBody}</Notice>
          ) : view.kind === "unreadable" ? (
            <Notice title={copy.expiredTitle}>{copy.unreadable}</Notice>
          ) : (
            <Notice title={copy.notFoundTitle}>{copy.notFoundBody}</Notice>
          )}
        </main>
        <footer className="text-center text-xs text-subtle">
          <a href="https://tryclinton.com" className="text-subtle hover:text-brand">
            {copy.footer}
          </a>
        </footer>
      </div>
    </div>
  );
}
