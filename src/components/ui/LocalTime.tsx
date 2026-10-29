"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * A date and time in the viewer's own time zone. The server can't know it, so nothing is
 * rendered until the browser takes over (no wrong times, no hydration mismatch).
 */
export function LocalTime({ iso, withDate = true }: { iso: string; withDate?: boolean }) {
  const inBrowser = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  if (!inBrowser) return <time dateTime={iso} />;
  const options: Intl.DateTimeFormatOptions = withDate
    ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    : { hour: "2-digit", minute: "2-digit" };
  return <time dateTime={iso}>{new Intl.DateTimeFormat(undefined, options).format(new Date(iso))}</time>;
}
