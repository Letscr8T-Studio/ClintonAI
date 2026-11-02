"use client";

import { useSyncExternalStore } from "react";
import { returningCopy as copy } from "@/content/app/home";

const noop = () => () => {};

/** Morning, afternoon or evening by the viewer's own clock (the server can't know their time zone). */
function partOfDay(): keyof typeof copy.greeting {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
}

/** "Good evening, Ada": "Welcome back" on the server, then the viewer's time of day. */
export function Greeting({ firstName }: { firstName: string | null }) {
  const part = useSyncExternalStore(noop, partOfDay, () => "neutral" as const);
  return <>{copy.title(copy.greeting[part], firstName)}</>;
}
