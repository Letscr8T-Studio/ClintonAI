"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { saveDisplayName } from "@/app/(app)/settings/actions";
import { settingsCopy } from "@/content/app/settings";
import { SaveStatus, type SaveState } from "./SaveStatus";

const copy = settingsCopy.name;

type Props = { initialName: string; email: string | null };

/** The From name, with a live preview of exactly what recipients see. */
export function NameSetting({ initialName, email }: Props) {
  const [saved, setSaved] = useState(initialName);
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const inputId = useId();
  const trimmed = name.trim();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const result = await saveDisplayName(trimmed);
      if (!result.ok) return setStatus({ kind: "error", text: result.error });
      setSaved(trimmed);
      setStatus({ kind: "saved", text: copy.saved });
    });
  };

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-line bg-white p-5 shadow-card sm:p-7">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-body">
        {copy.label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          autoComplete="name"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-line-strong bg-white px-4 text-[15px] text-ink outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending || trimmed === saved || trimmed === ""}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? copy.saving : copy.save}
        </button>
      </div>
      <p className="mt-4 mb-2 rounded-2xl bg-paper px-4 py-3 text-sm text-muted">
        {copy.preview} <span className="font-semibold text-ink">{trimmed || "…"}</span>
        {email ? <span className="text-muted"> &lt;{email}&gt;</span> : null}
      </p>
      <SaveStatus state={status} savingText={copy.saving} />
    </form>
  );
}
