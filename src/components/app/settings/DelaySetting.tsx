"use client";

import { useId, useState, useTransition } from "react";
import { saveDefaultDelay } from "@/app/(app)/settings/actions";
import { DelayTiles } from "@/components/app/onboarding/DelayTiles";
import { ProgressRing } from "@/components/app/ProgressRing";
import { delayOptions } from "@/content/app/onboarding";
import { settingsCopy } from "@/content/app/settings";
import { SMART_DELAY, formatDelay } from "@/lib/validation/profile";
import { formatClock } from "@/lib/time";
import { SaveStatus, type SaveState } from "./SaveStatus";

const copy = settingsCopy.delay;

/** The default Smart Delay: pick a tile and it saves straight away, with the ring as a preview. */
export function DelaySetting({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [status, setStatus] = useState<SaveState>({ kind: "idle" });
  const [, startTransition] = useTransition();
  const moodId = useId();
  const mood = delayOptions.find((o) => o.seconds === seconds)?.mood;

  const choose = (next: number) => {
    const previous = seconds;
    setSeconds(next);
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const result = await saveDefaultDelay(next);
      if (result.ok) return setStatus({ kind: "saved", text: copy.saved(formatDelay(next)) });
      setSeconds(previous); // the server didn't take it: show what's really saved
      setStatus({ kind: "error", text: result.error });
    });
  };

  return (
    <div className="flex flex-col gap-6 rounded-[28px] border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:p-7">
      <div className="flex shrink-0 justify-center">
        <ProgressRing
          tone="light"
          value={seconds / SMART_DELAY.max}
          caption={copy.caption}
          valueClassName="text-[26px]"
          sizeClassName="w-32"
        >
          {formatClock(seconds)}
        </ProgressRing>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <DelayTiles value={seconds} onChange={choose} describedBy={moodId} />
        <p id={moodId} className="m-0 text-sm text-ink">
          {mood}
        </p>
        <SaveStatus state={status} savingText={copy.saving} />
      </div>
    </div>
  );
}
