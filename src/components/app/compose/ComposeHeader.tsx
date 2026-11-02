import Link from "next/link";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { Close } from "@/components/ui/icons";
import { appRoutes } from "@/config/routes";
import { composeCopy as copy } from "@/content/app/compose";

/**
 * "New email" and the address it will be sent from (the user's own: trust rule 5). On phones,
 * where Compose is a full screen without the tab bar, a close button leads back Home.
 */
export function ComposeHeader({ fromEmail }: { fromEmail: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
      <div className="flex items-center gap-2">
        <Link
          href={appRoutes.home}
          aria-label={copy.close}
          className="-ml-2 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink sm:hidden"
        >
          <Close size={18} />
        </Link>
        <h1 className="m-0 font-display text-xl font-bold tracking-tight">{copy.title}</h1>
      </div>
      <p className="m-0 flex min-w-0 items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[13px] text-body">
        <GoogleMark size={14} />
        <span className="sr-only">{copy.from}: </span>
        <span className="truncate">{fromEmail}</span>
      </p>
    </div>
  );
}
