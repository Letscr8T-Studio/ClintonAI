import { site } from "@/config/site";
import type { Analytics } from "@/types/waitlist";
import { Sparkline } from "../Sparks";

export function OverviewHero({ a }: { a: Analytics }) {
  return (
    <section
      aria-label="Waitlist total"
      className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white sm:p-8"
    >
      <div className="relative z-10 max-w-md">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-amber" /> Waitlist
        </p>
        <p className="mt-4 font-display text-6xl leading-none font-extrabold tracking-tight tabular-nums sm:text-7xl">
          {a.total.toLocaleString()}
        </p>
        <p className="mt-2 text-on-brand">people are waiting for {site.name}</p>
        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
          <span>+{a.today} today</span>
          <span>+{a.last7} this week</span>
          <span>{a.surveyed} surveyed</span>
        </p>
      </div>
      <Sparkline
        values={a.cumulative}
        className="absolute inset-x-0 bottom-0 h-24 w-full text-white sm:right-0 sm:left-auto sm:h-32 sm:w-3/5"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-16 size-72 rounded-full bg-brand-light/40 blur-3xl"
      />
    </section>
  );
}
