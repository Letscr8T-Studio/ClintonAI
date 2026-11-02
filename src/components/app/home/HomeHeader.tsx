import Link from "next/link";
import { PlusIcon } from "@/components/ui/app-icons";
import { appRoutes } from "@/config/routes";
import { commands } from "@/content/app/commands";
import { returningCopy as copy } from "@/content/app/home";
import { SMART_DELAY, delayClock } from "@/lib/validation/profile";
import { Greeting } from "./Greeting";

type Props = { firstName: string | null; delaySeconds: number };

const writeKey = commands.find((c) => c.id === "compose")?.keys?.[0];

/**
 * Home for someone who has sent before: a one-line greeting, their Smart Delay, and Write. The
 * brand banner is for first visits; after that the page opens straight onto the numbers.
 */
export function HomeHeader({ firstName, delaySeconds }: Props) {
  const off = delaySeconds === SMART_DELAY.off;
  return (
    <header className="cl-rise flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="m-0 font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-bold tracking-[-0.035em]">
          <Greeting firstName={firstName} />
        </h1>
        <Link
          href={`${appRoutes.settings}#smart-delay`}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-body no-underline hover:border-brand-mist hover:text-ink"
        >
          <span
            aria-hidden="true"
            className={off ? "size-2 rounded-full bg-subtle" : "size-2 rounded-full bg-brand"}
          />
          {off ? copy.delayOff : copy.delay(delayClock(delaySeconds))}
          <span className="sr-only">. {copy.delayLabel}</span>
        </Link>
      </div>
      <Link
        href={appRoutes.compose}
        className="hidden min-h-11 items-center gap-2.5 rounded-2xl bg-brand pr-3 pl-4 text-sm font-semibold text-white no-underline shadow-cta transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-brand-deep motion-reduce:transition-none sm:inline-flex"
      >
        <PlusIcon size={16} />
        {copy.write}
        <span aria-hidden="true" className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[11px]">
          {writeKey}
        </span>
      </Link>
    </header>
  );
}
