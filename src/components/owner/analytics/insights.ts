import type { Analytics } from "@/types/waitlist";
import { percent } from "../format";

export type Insight = { label: string; value: string; sub: string };

const top = <T extends { count: number }>(items: T[]): T | undefined =>
  [...items].sort((x, y) => y.count - x.count)[0];

/** The four headline facts on the analytics page. Pure, so it is unit-tested. */
export function buildInsights(a: Analytics): Insight[] {
  const has = a.total > 0;
  const source = a.sources[0];
  const day = top(a.weekdays);
  const hour = top(a.hours);
  const converter = a.sources
    .filter((s) => s.count >= 3)
    .sort((x, y) => y.surveyed / y.count - x.surveyed / x.count)[0];

  return [
    {
      label: "Top source",
      value: has && source ? source.source : "–",
      sub: has && source ? `${percent(source.count, a.total)}% of signups` : "",
    },
    {
      label: "Best weekday",
      value: has && day ? day.label : "–",
      sub: has && day ? `${day.count} signups` : "",
    },
    {
      label: "Peak hour (Lagos)",
      value: has && hour ? hour.label : "–",
      sub: has && hour ? `${hour.count} signups` : "",
    },
    {
      label: "Best survey converter",
      value: converter ? converter.source : "–",
      sub: converter
        ? `${percent(converter.surveyed, converter.count)}% did the survey`
        : "Needs 3+ signups per source",
    },
  ];
}
