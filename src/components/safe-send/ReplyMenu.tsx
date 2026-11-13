"use client";

import { useEffect, useId, useState } from "react";
import { ReplyIcon } from "@/components/ui/app-icons";
import { buttonStyles } from "@/components/ui/Button";
import { viewCopy as copy } from "@/content/app/safe-send";
import { guessApp, replyOptions } from "@/lib/reply-links";

type Props = {
  /** The sender, who the reply goes to. */
  to: string;
  senderName: string;
  subject?: string;
  /** The address the message was sent to: picks the app (and Google account) to reply from. */
  recipient?: string;
};

const item =
  "flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink no-underline hover:bg-paper";

/**
 * Reply to the sender. When the recipient's address shows their webmail (Gmail, Outlook, Yahoo),
 * the main button opens it already addressed; the menu offers the others, the device's own email
 * app and copying the address, which always works.
 */
export function ReplyMenu({ to, senderName, subject, recipient }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuId = useId();
  const guessed = guessApp(recipient);
  const options = replyOptions(to, subject, recipient);
  const first = senderName.split(" ")[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => setOpen(!open)}
      className={buttonStyles({ variant: "secondary" })}
    >
      {guessed ? (
        copy.moreReply
      ) : (
        <>
          <ReplyIcon size={17} />
          {copy.reply(first)}
        </>
      )}
    </button>
  );

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {guessed ? (
        <a
          href={options[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: "secondary" })}
        >
          <ReplyIcon size={17} />
          {copy.replyIn(copy.replyApps[guessed])}
        </a>
      ) : null}
      {toggle}
      <ul
        id={menuId}
        hidden={!open}
        aria-label={copy.moreReply}
        className="absolute top-full left-0 z-10 m-0 mt-2 w-64 list-none rounded-2xl border border-line bg-white p-1.5 shadow-pop"
      >
        {options.slice(guessed ? 1 : 0).map((option) => (
          <li key={option.app}>
            <a
              href={option.href}
              {...(option.app === "mailto" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              onClick={() => setOpen(false)}
              className={item}
            >
              {copy.replyApps[option.app]}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={item}
            onClick={() =>
              navigator.clipboard.writeText(to).then(
                () => setCopied(true),
                () => undefined,
              )
            }
          >
            {copied ? copy.copied : copy.copyAddress(to)}
          </button>
        </li>
      </ul>
    </div>
  );
}
