"use client";

import { useEffect, useRef } from "react";
import { commands, type Command } from "@/content/app/commands";
import { SEQUENCE_MS, isTyping, matchKeys } from "@/lib/shortcuts";

/** Fired by anything that wants the command menu open (the header's search button). */
export const OPEN_COMMAND_MENU = "clinton:command-menu";

type Handlers = { open: () => void; run: (command: Command) => void };

/**
 * App-wide keys: Ctrl/Cmd + K or / opens the command menu; single keys (C) and two-key
 * sequences (G then H) run commands. Never while typing in a field or with a dialog open.
 */
export function useShortcuts({ open, run }: Handlers) {
  const pending = useRef<{ keys: string[]; at: number }>({ keys: [], at: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        return open();
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "/") {
        e.preventDefault();
        return open();
      }
      const key = e.key.toLowerCase();
      const now = Date.now();
      const earlier = now - pending.current.at < SEQUENCE_MS ? pending.current.keys : [];
      // A key that doesn't continue the sequence may still start one of its own.
      for (const keys of earlier.length ? [[...earlier, key], [key]] : [[key]]) {
        const result = matchKeys(keys, commands);
        if (result.kind === "match") {
          e.preventDefault();
          pending.current = { keys: [], at: 0 };
          return run(result.command);
        }
        if (result.kind === "pending") {
          pending.current = { keys, at: now };
          return;
        }
      }
      pending.current = { keys: [], at: 0 };
    };
    const onOpen = () => open();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_MENU, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_MENU, onOpen);
    };
  }, [open, run]);
}
