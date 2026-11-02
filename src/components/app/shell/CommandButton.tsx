"use client";

import { SearchIcon } from "@/components/ui/app-icons";
import { commandsCopy as copy } from "@/content/app/commands";
import { KeyCaps } from "./KeyCaps";
import { OPEN_COMMAND_MENU } from "./useShortcuts";

/** The header's way into the command menu: a search field on wide screens, an icon on phones. */
export function CommandButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_MENU))}
      aria-haspopup="dialog"
      className="inline-flex size-10 cursor-pointer items-center justify-center gap-2 rounded-full text-muted transition-colors hover:bg-surface hover:text-ink md:w-64 md:justify-start md:border md:border-line md:bg-surface/60 md:pr-2 md:pl-3.5"
    >
      <SearchIcon size={17} />
      <span className="sr-only flex-1 truncate text-left text-sm whitespace-nowrap md:not-sr-only">
        {copy.open}
      </span>
      <span aria-hidden="true" className="hidden md:inline-flex">
        <KeyCaps keys={copy.hintKeys} />
      </span>
    </button>
  );
}
