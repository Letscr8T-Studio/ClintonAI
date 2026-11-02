"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { SearchIcon } from "@/components/ui/app-icons";
import { commands, commandsCopy as copy, type Command, type CommandGroup } from "@/content/app/commands";
import { cn } from "@/lib/cn";
import { filterCommands } from "@/lib/shortcuts";
import type { Theme } from "@/lib/validation/theme";
import { KeyCaps, ShortcutList } from "./KeyCaps";
import { useShortcuts } from "./useShortcuts";
import { useTheme } from "./useTheme";

const GROUPS: CommandGroup[] = ["actions", "go", "theme"];

/**
 * Ctrl/Cmd + K: jump to a page, write an email, change the theme, or see the shortcuts. A native
 * modal dialog (focus is trapped and Esc closes it); the list is a combobox, so arrow keys move
 * through it and screen readers hear the highlighted command.
 */
export function CommandMenu({ initialTheme }: { initialTheme: Theme }) {
  const router = useRouter();
  const { theme, apply } = useTheme(initialTheme);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"commands" | "shortcuts">("commands");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listId = useId();
  const results = filterCommands(commands, query);
  const active = results[Math.min(index, results.length - 1)];

  const open = useCallback((next: "commands" | "shortcuts" = "commands") => {
    setMode(next);
    setQuery("");
    setIndex(0);
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  const run = useCallback(
    (c: Command) => {
      if (c.shortcuts) return open("shortcuts");
      dialog.current?.close();
      if (c.theme) void apply(c.theme);
      if (c.href) router.push(c.href);
    },
    [apply, open, router],
  );

  useShortcuts({ open, run });

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (step && results.length) {
      e.preventDefault();
      setIndex((i) => (Math.min(i, results.length - 1) + step + results.length) % results.length);
    } else if (e.key === "Enter" && active) {
      e.preventDefault();
      run(active);
    }
  };

  const optionId = (c: Command) => `${listId}-${c.id}`;
  return (
    <dialog
      ref={dialog}
      aria-label={mode === "commands" ? copy.label : copy.shortcutsTitle}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      className="m-auto mt-[12vh] w-[min(560px,calc(100%-2rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-pop backdrop:bg-night/50 backdrop:backdrop-blur-sm"
    >
      {mode === "shortcuts" ? (
        <ShortcutList />
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <SearchIcon className="shrink-0 text-muted" />
            <input
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active ? optionId(active) : undefined}
              aria-label={copy.inputLabel}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={copy.placeholder}
              className="min-w-0 flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-placeholder"
            />
          </div>
          <div
            id={listId}
            role="listbox"
            aria-label={copy.label}
            className="max-h-[min(64vh,540px)] overflow-y-auto p-2"
          >
            {results.length === 0 ? (
              <p className="m-0 px-3 py-6 text-center text-sm text-muted">{copy.empty}</p>
            ) : null}
            {GROUPS.map((g) => {
              const items = results.filter((c) => c.group === g);
              if (!items.length) return null;
              return (
                <div key={g} role="group" aria-labelledby={`${listId}-${g}`}>
                  <div
                    id={`${listId}-${g}`}
                    className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-wider text-muted uppercase"
                  >
                    {copy.groups[g]}
                  </div>
                  {items.map((c) => (
                    <div
                      key={c.id}
                      id={optionId(c)}
                      role="option"
                      aria-selected={c === active}
                      onClick={() => run(c)}
                      onMouseMove={() => setIndex(results.indexOf(c))}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm",
                        c === active ? "bg-brand-tint text-brand-ink" : "text-ink",
                      )}
                    >
                      <span className="flex-1">{c.label}</span>
                      {c.theme === theme ? <span className="text-xs text-muted">{copy.current}</span> : null}
                      {c.keys ? <KeyCaps keys={c.keys} sequence /> : null}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </dialog>
  );
}
