"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Close, Menu } from "@/components/ui/icons";
import { mainNav, primaryCta } from "@/content/navigation";

/** Disclosure menu for narrow screens. Closes on Escape, on link click and on outside click. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
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

  const links = [...mainNav, primaryCta];

  return (
    <div ref={root} className="relative min-[821px]:hidden">
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-white text-ink"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <Close /> : <Menu />}
      </button>
      <nav
        id={panelId}
        aria-label="Mobile"
        hidden={!open}
        className="absolute top-[calc(100%+8px)] right-0 z-40 w-56 rounded-2xl border border-line bg-white p-2 shadow-tile"
      >
        <ul className="m-0 list-none p-0">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-3 text-[15px] font-medium text-ink no-underline hover:bg-brand-wash"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
