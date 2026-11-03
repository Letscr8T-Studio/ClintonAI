"use client";

import { useId, useState, useTransition } from "react";
import { saveOpenTracking } from "@/app/(app)/settings/actions";
import { Switch } from "@/components/ui/Switch";
import { settingsCopy } from "@/content/app/settings";
import { SaveStatus, type SaveState } from "./SaveStatus";

const copy = settingsCopy.tracking;

/** "Likely opened" for new emails: off by default, explained honestly, saved straight away. */
export function OpenTrackingSetting({ initialOn }: { initialOn: boolean }) {
  const [on, setOn] = useState(initialOn);
  const [status, setStatus] = useState<SaveState>({ kind: "idle" });
  const [, startTransition] = useTransition();
  const helpId = useId();

  const toggle = (next: boolean) => {
    setOn(next);
    startTransition(async () => {
      const result = await saveOpenTracking(next);
      if (result.ok) return setStatus({ kind: "saved", text: next ? copy.savedOn : copy.savedOff });
      setOn(!next);
      setStatus({ kind: "error", text: result.error });
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-5 shadow-card sm:p-7">
      <Switch on={on} onChange={toggle} label={copy.toggle} describedBy={helpId} />
      <div id={helpId} className="flex flex-col gap-2 text-sm leading-relaxed text-muted">
        <p className="m-0">{copy.how}</p>
        <p className="m-0">{copy.honest}</p>
      </div>
      <SaveStatus state={status} savingText="" />
    </div>
  );
}
