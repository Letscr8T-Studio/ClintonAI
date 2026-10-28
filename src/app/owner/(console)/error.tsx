"use client";

import { useEffect } from "react";
import { card } from "@/components/owner/styles";
import { Button } from "@/components/ui/Button";

// One error state for every console page (usually missing Supabase env vars or a database outage).
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[owner console]", error);
  }, [error]);

  return (
    <div role="alert" className={`${card} p-6`}>
      <h1 className="font-display text-2xl font-bold">Couldn&apos;t load the data</h1>
      <p className="mt-2 text-sm text-muted">
        Check the Supabase env vars and the server logs, then try again.
      </p>
      <Button shape="soft" size="sm" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
