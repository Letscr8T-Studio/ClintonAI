"use client";

import { useSyncExternalStore } from "react";

// One shared 1-second clock for every countdown on the page.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Whole seconds, so the value is stable between ticks (as useSyncExternalStore requires). */
const currentSecond = () => Math.floor(Date.now() / 1000) * 1000;

/**
 * The current time, ticking every second; null while rendering on the server, so times and
 * countdowns are only ever shown in the viewer's own clock and time zone.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, currentSecond, () => null);
}

/** "14:37" in the viewer's own time zone. */
export function clockTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
