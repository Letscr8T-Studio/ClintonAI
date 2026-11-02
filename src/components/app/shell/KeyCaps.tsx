import { commands, commandsCopy as copy } from "@/content/app/commands";

/** Keys as small caps: "G then H" for a sequence, "Ctrl + K" for a chord. */
export function KeyCaps({ keys, sequence = false }: { keys: string[]; sequence?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted">
      {keys.map((k, i) => (
        <span key={k} className="inline-flex items-center gap-1">
          {i > 0 && sequence ? <span>{copy.then}</span> : null}
          <kbd className="min-w-6 rounded-md border border-line-strong bg-paper px-1.5 py-0.5 text-center font-mono text-[11px] text-body">
            {k}
          </kbd>
        </span>
      ))}
    </span>
  );
}

/** Every shortcut, for the "?" view of the command menu. */
export function ShortcutList() {
  const rows = [
    ...commands.flatMap((c) => (c.keys ? [{ keys: c.keys, label: c.label, sequence: true }] : [])),
    ...copy.extraShortcuts.map((s) => ({ ...s, sequence: false })),
  ];
  return (
    <div className="p-5">
      <h2 className="m-0 font-display text-lg font-bold tracking-tight">{copy.shortcutsTitle}</h2>
      <p className="mt-1 mb-4 text-sm text-muted">{copy.shortcutsBody}</p>
      <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5">
        {rows.map((r) => (
          <div key={r.label + r.keys.join()} className="contents">
            <dt className="text-sm text-ink">{r.label}</dt>
            <dd className="m-0 justify-self-end">
              <KeyCaps keys={r.keys} sequence={r.sequence} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
