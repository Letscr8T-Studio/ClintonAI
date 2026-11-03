"use client";

import { useId, useRef } from "react";
import { PaperclipIcon, SparkleIcon } from "@/components/ui/app-icons";
import { attachCopy, rewriteCopy } from "@/content/app/compose-options";
import { cn } from "@/lib/cn";
import { REWRITE_MODES } from "@/lib/validation/rewrite";
import { usePopover } from "./usePopover";
import type { useRewrite } from "./useRewrite";

type Props = { onAttach: (files: File[]) => void; rewrite: ReturnType<typeof useRewrite> };

const tool =
  "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-body transition-colors hover:bg-paper hover:text-ink disabled:cursor-wait disabled:opacity-60";

/** Under the message: Attach, and Rewrite with Clinton (fix, shorter, friendlier, formal), with Undo. */
export function ComposeToolbar({ onAttach, rewrite }: Props) {
  const files = useRef<HTMLInputElement>(null);
  const { open, setOpen, ref, onKeyDown } = usePopover();
  const menuId = useId();

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 pb-3 sm:px-5">
      <input
        ref={files}
        type="file"
        multiple
        hidden
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          onAttach(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <button type="button" onClick={() => files.current?.click()} className={tool}>
        <PaperclipIcon size={17} />
        <span className="sr-only sm:not-sr-only">{attachCopy.button}</span>
      </button>

      <div ref={ref} className="relative" onKeyDown={onKeyDown}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={menuId}
          disabled={rewrite.working}
          className={cn(tool, "text-brand-ink")}
        >
          <SparkleIcon size={17} />
          {rewrite.working ? rewriteCopy.working : rewriteCopy.button}
        </button>
        {open ? (
          <div
            id={menuId}
            role="group"
            aria-label={rewriteCopy.menuLabel}
            className="cl-pop absolute bottom-[calc(100%+6px)] left-0 z-40 w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-1.5 shadow-pop"
          >
            {REWRITE_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setOpen(false);
                  void rewrite.run(mode);
                }}
                className="flex w-full cursor-pointer flex-col items-start rounded-xl px-3 py-2 text-left hover:bg-brand-wash"
              >
                <span className="text-sm font-semibold text-ink">{rewriteCopy.modes[mode].label}</span>
                <span className="text-xs text-muted">{rewriteCopy.modes[mode].hint}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p
        role="status"
        className={cn("m-0 ml-auto text-[13px]", rewrite.error ? "text-danger-ink" : "text-muted")}
      >
        {rewrite.message}
        {rewrite.canUndo ? (
          <button
            type="button"
            onClick={rewrite.undo}
            className="ml-2 cursor-pointer font-semibold text-brand-ink underline-offset-2 hover:underline"
          >
            {rewriteCopy.undo}
          </button>
        ) : null}
      </p>
    </div>
  );
}
