"use client";

import { useLayoutEffect, useMemo, useRef, useState, type RefObject, type SyntheticEvent } from "react";
import { findingLabels, panelCopy as copy } from "@/content/app/compose";
import { flagAt, flagRanges, segments } from "@/lib/check/flags";
import type { Finding } from "@/lib/check/types";
import { FlagPopover } from "./FlagPopover";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid: boolean;
  describedBy?: string;
  fieldRef: RefObject<HTMLTextAreaElement | null>;
  /** Open findings for the message; their words are highlighted where they still appear. */
  findings: Finding[];
  onFix: (finding: Finding) => void;
  onIgnore: (id: string) => void;
};

// The mirror and the textarea must wrap text identically.
const text = "px-5 py-5 text-[15px] leading-relaxed whitespace-pre-wrap break-words sm:px-7";

/**
 * The message box, with Clinton's findings highlighted in the text itself. A hidden copy of the
 * text sits behind a transparent textarea and draws the highlights; when the caret lands on one,
 * a popover offers the fix. The panel beside Compose lists the same findings for anyone who
 * prefers a list, and every action stays the user's choice (trust rule 4).
 */
export function MessageField({ value, onChange, findings, onFix, onIgnore, fieldRef, ...field }: Props) {
  const flags = useMemo(() => flagRanges(value, findings), [value, findings]);
  const [caret, setCaret] = useState<number | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const marks = useRef(new Map<string, HTMLElement>());
  const wrap = useRef<HTMLDivElement>(null);
  const popover = useRef<HTMLDivElement>(null);
  const active = caret === null ? undefined : flagAt(flags, caret);

  useLayoutEffect(() => {
    const mark = active && marks.current.get(active.finding.id);
    if (!mark || !wrap.current) return setPos(null);
    const room = wrap.current.clientWidth - Math.min(340, wrap.current.clientWidth - 32) - 16;
    setPos({
      top: mark.offsetTop + mark.offsetHeight + 6,
      left: Math.max(16, Math.min(mark.offsetLeft, room)),
    });
  }, [active]);

  const track = (e: SyntheticEvent<HTMLTextAreaElement>) => setCaret(e.currentTarget.selectionStart);
  const close = () => {
    setCaret(null);
    fieldRef.current?.focus();
  };
  const leaving = (to: EventTarget | null) =>
    !(to instanceof Node) || !(popover.current?.contains(to) || fieldRef.current?.contains(to));

  return (
    <div ref={wrap} className="relative">
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 text-transparent ${text}`}>
        {segments(value, flags).map((s, i) =>
          s.flag ? (
            <mark
              key={s.flag.finding.id}
              ref={(el) => {
                if (el) marks.current.set(s.flag!.finding.id, el);
                else marks.current.delete(s.flag!.finding.id);
              }}
              data-active={s.flag === active || undefined}
              className="cl-flag"
            >
              {s.text}
            </mark>
          ) : (
            <span key={i}>{s.text}</span>
          ),
        )}
      </div>
      <textarea
        id="compose-body"
        ref={fieldRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          track(e);
        }}
        onSelect={track}
        onClick={track}
        onBlur={(e) => leaving(e.relatedTarget) && setCaret(null)}
        onKeyDown={(e) => e.key === "Escape" && active && setCaret(null)}
        placeholder={field.placeholder}
        aria-invalid={field.invalid}
        aria-describedby={field.describedBy}
        className={`relative block [field-sizing:content] min-h-[320px] w-full resize-none bg-transparent text-ink outline-none placeholder:text-placeholder ${text}`}
      />
      <p aria-live="polite" className="sr-only">
        {active ? copy.inlineAnnounce(findingLabels[active.finding.type], active.finding.message) : ""}
      </p>
      {active && pos ? (
        <FlagPopover
          ref={popover}
          finding={active.finding}
          style={pos}
          onFix={() => {
            setCaret(null);
            onFix(active.finding);
          }}
          onIgnore={() => {
            onIgnore(active.finding.id);
            close();
          }}
          onClose={close}
          onBlur={(to) => leaving(to) && setCaret(null)}
        />
      ) : null}
    </div>
  );
}
