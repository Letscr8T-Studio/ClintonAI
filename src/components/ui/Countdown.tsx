"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/lib/time";

/**
 * Decorative mm:ss countdown that loops back to `from`. Always render it inside
 * an aria-hidden illustration: a ticking live region would be noise for screen readers.
 */
export function Countdown({ from = 1499 }: { from?: number }) {
  const [secs, setSecs] = useState(from);

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : from)), 1000);
    return () => clearInterval(id);
  }, [from]);

  return <span suppressHydrationWarning>{formatClock(secs)}</span>;
}
