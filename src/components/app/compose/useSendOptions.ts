"use client";

import { useState } from "react";

export type SendDefaults = { delaySeconds: number; trackOpens: boolean };

/**
 * How this one email goes out: its Smart Delay, Safe Send (off by default, trust rule 3),
 * "Likely opened" (the account's default) and Send later. Reset for every new email.
 */
export function useSendOptions(defaults: SendDefaults) {
  const [delaySeconds, setDelaySeconds] = useState(defaults.delaySeconds);
  const [safeSend, setSafeSend] = useState(false);
  const [trackOpens, setTrackOpens] = useState(defaults.trackOpens);
  const [sendAt, setSendAt] = useState<Date | null>(null);

  const reset = (next: { safeSend?: boolean } = {}) => {
    setDelaySeconds(defaults.delaySeconds);
    setSafeSend(next.safeSend ?? false);
    setTrackOpens(defaults.trackOpens);
    setSendAt(null);
  };

  return {
    delaySeconds,
    setDelaySeconds,
    safeSend,
    setSafeSend,
    // Safe Send already knows exactly who opened it; the pixel never goes with it.
    trackOpens: trackOpens && !safeSend,
    setTrackOpens,
    sendAt,
    setSendAt,
    reset,
  };
}

export type SendOptions = ReturnType<typeof useSendOptions>;
