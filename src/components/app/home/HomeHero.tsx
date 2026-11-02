import Link from "next/link";
import { ProgressRing } from "@/components/app/ProgressRing";
import { appRoutes } from "@/config/routes";
import { homeCopy as copy } from "@/content/app/home";
import { SMART_DELAY, delayClock, formatDelay } from "@/lib/validation/profile";

const at = (ms: number) => ({ animationDelay: `${ms}ms` });

type Props = { firstName: string | null; delaySeconds: number; connected: boolean };

/** Brand banner: greeting, the promise, and the user's Smart Delay as a ring. */
export function HomeHero({ firstName, delaySeconds, connected }: Props) {
  const minutes = formatDelay(delaySeconds);
  return (
    <section
      aria-labelledby="home-h"
      className="stage-brand cl-rise relative overflow-hidden rounded-[28px] px-6 py-8 text-white sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-12"
    >
      <div aria-hidden="true" className="stage-grid absolute inset-0" />
      <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[620px]">
          <p className="m-0 font-mono text-xs tracking-wider text-on-brand uppercase">
            {copy.eyebrow(firstName)}
          </p>
          <h1
            id="home-h"
            className="mt-3 mb-0 font-display text-[clamp(36px,5vw,60px)] leading-[0.98] font-bold tracking-[-0.045em]"
          >
            <span className="anim-word inline-block" style={at(80)}>
              {copy.title}
            </span>{" "}
            <span className="anim-word block text-brand-tint" style={at(200)}>
              {copy.accent}
            </span>
          </h1>
          <p className="mt-4 mb-0 max-w-[520px] text-[clamp(15px,1.3vw,17px)] leading-relaxed text-on-brand">
            {connected ? copy.bodyConnected : copy.body}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-3 pr-5 md:flex-col md:gap-3 md:bg-transparent md:p-0 md:text-center">
          <ProgressRing
            tone="brand"
            value={delaySeconds / SMART_DELAY.max}
            caption={copy.delay.caption}
            valueClassName="text-[18px] md:text-[32px]"
            sizeClassName="w-20 md:w-40"
            captionClassName="hidden md:block"
            className="shrink-0"
          >
            {delayClock(delaySeconds)}
          </ProgressRing>
          <div className="flex flex-col gap-1.5 md:items-center">
            <p className="m-0 max-w-[180px] text-sm leading-snug text-on-brand">
              {delaySeconds === SMART_DELAY.off ? copy.delay.off : copy.delay.body(minutes)}
            </p>
            <Link
              href={`${appRoutes.settings}#smart-delay`}
              aria-label={copy.delay.changeLabel}
              className="self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white no-underline hover:bg-white/25 md:self-center"
            >
              {copy.delay.change}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
