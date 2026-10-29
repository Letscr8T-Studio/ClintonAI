"use client";

import { useEffect, useId, useRef, useState } from "react";
import { appRoutes } from "@/config/routes";
import { appShellCopy as copy } from "@/content/app/home";
import { cn } from "@/lib/cn";

type Props = { name: string | null; email: string | null };

function initials(name: string | null, email: string | null): string {
  const source = name?.trim() || email || "?";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (name ? (parts[1]?.[0] ?? "") : "")).toUpperCase() || "?";
}

/** Avatar button that opens who is signed in and Sign out. Escape or a click outside closes it. */
export function AccountMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-line bg-white py-1 pr-3 pl-1 transition-colors hover:border-brand-mist"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-full bg-brand font-display text-[13px] font-bold text-white"
        >
          {initials(name, email)}
        </span>
        <span className="sr-only">{copy.accountMenu}: </span>
        <span className="hidden max-w-[160px] truncate text-sm font-medium text-ink sm:block">
          {name ?? email}
        </span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={cn("text-muted transition-transform", open && "rotate-180")}
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="cl-pop absolute right-0 z-30 mt-2 w-[min(280px,calc(100vw-40px))] origin-top-right rounded-2xl border border-line bg-white p-2 shadow-mock"
      >
        <div className="px-3 pt-2 pb-3">
          <p className="m-0 font-mono text-[10px] tracking-wider text-muted uppercase">{copy.signedInAs}</p>
          {name ? <p className="m-0 mt-1 truncate font-semibold text-ink">{name}</p> : null}
          {email ? <p className="m-0 truncate text-sm text-muted">{email}</p> : null}
        </div>
        <form action={appRoutes.signOut} method="post" className="border-t border-line pt-2">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper"
          >
            {copy.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
