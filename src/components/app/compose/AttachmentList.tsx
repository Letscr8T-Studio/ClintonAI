import { Close } from "@/components/ui/icons";
import { PaperclipIcon } from "@/components/ui/app-icons";
import { attachCopy as copy } from "@/content/app/compose-options";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/files";
import type { Attachment } from "./useAttachments";

type Props = { items: Attachment[]; notice: string | null; onRemove: (key: string) => void };

/** The attached files as chips under the message, each with its size and a remove button. */
export function AttachmentList({ items, notice, onRemove }: Props) {
  if (!items.length && !notice) return null;
  return (
    <div className="flex flex-col gap-2 px-5 pb-3 sm:px-7">
      {items.length ? (
        <ul aria-label={copy.listLabel} className="m-0 flex list-none flex-wrap gap-2 p-0">
          {items.map((file) => (
            <li
              key={file.key}
              className={cn(
                "flex max-w-full items-center gap-2 rounded-xl border py-1.5 pr-1 pl-3 text-[13px]",
                file.status === "failed" ? "border-danger/40 bg-danger-bg" : "border-line bg-paper",
              )}
            >
              <PaperclipIcon size={14} className="shrink-0 text-muted" />
              <span className="min-w-0 truncate font-medium text-ink">{file.name}</span>
              <span className="shrink-0 text-muted" aria-live="polite">
                {file.status === "uploading"
                  ? copy.uploading
                  : file.status === "failed"
                    ? copy.failed
                    : formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(file.key)}
                aria-label={copy.remove(file.name)}
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-line hover:text-ink"
              >
                <Close size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {notice ? (
        <p role="alert" className="m-0 text-[13px] font-medium text-danger-ink">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
