"use client";

import dynamic from "next/dynamic";

/**
 * Compose renders in the browser only: it may pick up a draft handed over by the Outbox (session
 * storage), which the server can't see. A quiet skeleton shows for the moment it takes to load.
 */
export const ComposeLoader = dynamic(() => import("./ComposeWorkspace").then((m) => m.ComposeWorkspace), {
  ssr: false,
  loading: () => (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="h-[520px] animate-pulse rounded-[28px] border border-line bg-white" />
      <div className="h-[280px] animate-pulse rounded-[28px] bg-ink/90" />
    </div>
  ),
});
