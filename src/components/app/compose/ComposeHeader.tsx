import { GoogleMark } from "@/components/ui/GoogleMark";
import { composeCopy as copy } from "@/content/app/compose";

/** "New email" and the address it will be sent from (the user's own: trust rule 5). */
export function ComposeHeader({ fromEmail }: { fromEmail: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
      <h1 className="m-0 font-display text-xl font-bold tracking-tight">{copy.title}</h1>
      <p className="m-0 flex min-w-0 items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[13px] text-body">
        <GoogleMark size={14} />
        <span className="sr-only">{copy.from}: </span>
        <span className="truncate">{fromEmail}</span>
      </p>
    </div>
  );
}
