import Link from "next/link";
import { appRoutes } from "@/config/routes";
import { statsCopy as copy } from "@/content/app/dashboard";
import { cn } from "@/lib/cn";
import type { DashboardStats } from "@/types/dashboard";

type Tile = {
  id: string;
  label: string;
  value: number;
  note: string;
  /** Part of the value, drawn as a thin bar on a lighter track of the same hue. */
  meter?: { part: number; whole: number; label: string };
  href?: string;
  accent?: boolean;
};

const nf = new Intl.NumberFormat("en", { notation: "compact" });

export function tilesFor(s: DashboardStats): Tile[] {
  const unsend = s.waiting + s.withdrawable;
  return [
    { id: "sent", label: copy.sent.label, value: s.sent, note: copy.sent.note },
    {
      id: "caught",
      label: copy.caught.label,
      value: s.caught,
      note: copy.caught.note(s.fixed),
      meter: s.caught
        ? { part: s.fixed, whole: s.caught, label: copy.caught.meter(s.fixed, s.caught) }
        : undefined,
    },
    {
      id: "opens",
      label: copy.opens.label,
      value: s.safeSendOpened,
      note: s.safeSendPeople ? copy.opens.note(s.safeSendPeople) : copy.opens.none,
      meter: s.safeSendPeople
        ? {
            part: s.safeSendOpened,
            whole: s.safeSendPeople,
            label: copy.opens.meter(s.safeSendOpened, s.safeSendPeople),
          }
        : undefined,
    },
    {
      id: "unsend",
      label: copy.unsend.label,
      value: unsend,
      note: unsend ? copy.unsend.note(s.waiting, s.withdrawable) : copy.unsend.none,
      href: appRoutes.outbox,
      accent: unsend > 0,
    },
  ];
}

/** The KPI row: four numbers, each with what it means. */
export function StatTiles({ stats }: { stats: DashboardStats }) {
  return (
    <section aria-labelledby="stats-h" className="cl-rise" style={{ animationDelay: "80ms" }}>
      <h2 id="stats-h" className="m-0 mb-3 font-mono text-xs tracking-wider text-muted uppercase">
        {copy.title}
      </h2>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-4">
        {tilesFor(stats).map((t) => (
          <li
            key={t.id}
            className={cn(
              "relative flex flex-col gap-1 rounded-[22px] border p-4 sm:p-5",
              t.accent ? "border-brand bg-brand text-white shadow-cta" : "border-line bg-surface shadow-card",
            )}
          >
            <p className={cn("m-0 text-[13px] font-semibold", t.accent ? "text-on-brand" : "text-muted")}>
              {t.href ? (
                <Link
                  href={t.href}
                  className="text-inherit no-underline after:absolute after:inset-0 after:rounded-[22px] hover:underline"
                >
                  {t.label}
                </Link>
              ) : (
                t.label
              )}
            </p>
            <p className="m-0 font-display text-[clamp(30px,4vw,40px)] leading-none font-bold tracking-tight tabular-nums">
              {nf.format(t.value)}
            </p>
            {t.meter ? (
              <div
                role="img"
                aria-label={t.meter.label}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-tint"
              >
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.round((t.meter.part / t.meter.whole) * 100)}%` }}
                />
              </div>
            ) : null}
            <p
              className={cn("m-0 mt-1 text-[12.5px] leading-snug", t.accent ? "text-on-brand" : "text-muted")}
            >
              {t.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
