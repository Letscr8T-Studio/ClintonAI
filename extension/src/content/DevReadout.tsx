import { useId, useState } from "react";
import { composeBarDevCopy as copy } from "@/content/extension";
import { captureStructure } from "../gmail/capture";
import type { GmailDraft } from "../gmail/compose";

const list = (items: string[]) => (items.length ? items.join(", ") : copy.none);

/**
 * Development builds only: what Clinton AI read from this compose window, so it can be checked
 * against real Gmail, and a button that copies an anonymised outline of the window's structure.
 */
export function DevReadout({ compose, draft }: { compose: Element; draft: GmailDraft }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelId = useId();
  const lose = Object.entries(draft.rich)
    .filter(([, has]) => has)
    .map(([kind]) => kind);

  const rows: [string, string][] = [
    [copy.labels.to, list(draft.to)],
    [copy.labels.cc, list(draft.cc)],
    [copy.labels.bcc, list(draft.bcc)],
    [copy.labels.subject, draft.subject || copy.none],
    [copy.labels.body, draft.body || copy.none],
    [copy.labels.signature, draft.signature || copy.none],
    [copy.labels.quoted, draft.quoted ? copy.yes : copy.no],
    [copy.labels.attachments, String(draft.gmailAttachments)],
    [copy.labels.rich, list(lose)],
  ];

  const copyStructure = async () => {
    await navigator.clipboard.writeText(captureStructure(compose));
    setCopied(true);
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="h-8 cursor-pointer rounded-full border border-dashed border-line-strong bg-surface px-2.5 text-xs text-muted"
      >
        {copy.toggle}
      </button>
      <section
        id={panelId}
        hidden={!open}
        aria-label={copy.heading}
        className="absolute bottom-10 left-0 z-10 w-96 rounded-xl border border-line-strong bg-surface p-3 text-xs text-ink"
      >
        <h2 className="m-0 mb-2 text-xs font-semibold">{copy.heading}</h2>
        <dl className="m-0 grid max-h-72 grid-cols-[auto_1fr] gap-x-3 gap-y-1 overflow-auto">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="m-0 break-words whitespace-pre-wrap">{value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={copyStructure}
          className="mt-2 cursor-pointer rounded-lg border border-line bg-paper px-2 py-1 text-xs"
        >
          {copied ? copy.copied : copy.copy}
        </button>
      </section>
    </>
  );
}
