"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * A date and time in the viewer's own time zone. The server can't know it, so the server (and the
 * first browser render) shows the time in UTC, labelled; the browser then swaps in local time.
 * Both first renders match, so there's no hydration mismatch, and a sentence is never left with a
 * gap while the page's script loads.
 */
export function LocalTime({ iso, withDate = true }: { iso: string; withDate?: boolean }) {
  const inBrowser = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const options: Intl.DateTimeFormatOptions = withDate
    ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    : { hour: "2-digit", minute: "2-digit" };
  const date = new Date(iso);
  const text = inBrowser
    ? new Intl.DateTimeFormat(undefined, options).format(date)
    : `${new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(date)} UTC`;
  return <time dateTime={iso}>{text}</time>;
}
