"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <h1 className="m-0 font-display text-4xl font-bold tracking-[-0.03em]">Something went wrong.</h1>
      <p className="m-0 text-muted">Please try again. If it keeps happening, refresh the page.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
