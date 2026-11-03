"use client";

import { useId, useState } from "react";
import { ClockIcon } from "@/components/ui/app-icons";
import { Close } from "@/components/ui/icons";
import { scheduleCopy as copy } from "@/content/app/compose-options";
import { formatWhen, scheduleOptions, toLocalInput } from "@/lib/schedule";
import { scheduleError } from "@/lib/validation/compose";
import { usePopover } from "./usePopover";

type Props = { value: Date | null; onChange: (when: Date | null) => void };

const pick =
  "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-left text-sm text-ink hover:bg-brand-wash";

/** Send later: quick picks or any date and time, up to 30 days ahead. Shown as a chip once set. */
export function SchedulePicker({ value, onChange }: Props) {
  const { open, setOpen, ref, onKeyDown } = usePopover();
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const panelId = useId();
  const now = new Date();

  const choose = (when: Date) => {
    const problem = scheduleError(when);
    if (problem) return setError(problem);
    onChange(when);
    setOpen(false);
    setError(null);
  };

  if (value) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-tint py-1 pr-1 pl-3 text-[13px] font-semibold whitespace-nowrap text-brand-ink">
        <ClockIcon size={14} />
        {copy.chip(formatWhen(value))}
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={copy.clear}
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-brand-mist"
        >
          <Close size={14} />
        </button>
      </span>
    );
  }

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-line-strong px-3.5 text-sm font-semibold text-ink hover:bg-paper"
      >
        <ClockIcon size={17} />
        <span className="sr-only sm:not-sr-only">{copy.button}</span>
      </button>
      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label={copy.title}
          className="cl-pop absolute bottom-[calc(100%+8px)] left-0 z-40 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-2 shadow-pop sm:right-0 sm:left-auto"
        >
          <p className="m-0 px-3 pt-2 font-display text-base font-bold">{copy.title}</p>
          <p className="mt-0.5 mb-2 px-3 text-xs text-muted">{copy.body}</p>
          {scheduleOptions(now).map((o) => (
            <button key={o.id} type="button" onClick={() => choose(o.at)} className={pick}>
              <span>{copy[o.id]}</span>
              <span className="text-xs text-muted">{formatWhen(o.at, now)}</span>
            </button>
          ))}
          <div className="mt-1 border-t border-line px-3 pt-3 pb-2">
            <label htmlFor={`${panelId}-at`} className="text-xs font-medium text-muted">
              {copy.custom}
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id={`${panelId}-at`}
                type="datetime-local"
                value={custom}
                min={toLocalInput(now)}
                onChange={(e) => setCustom(e.target.value)}
                aria-describedby={error ? `${panelId}-error` : undefined}
                className="min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-2.5 py-2 text-sm text-ink"
              />
              <button
                type="button"
                disabled={!custom}
                onClick={() => choose(new Date(custom))}
                className="cursor-pointer rounded-xl bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.set}
              </button>
            </div>
            {error ? (
              <p
                id={`${panelId}-error`}
                role="alert"
                className="mt-2 mb-0 text-xs font-medium text-danger-ink"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
