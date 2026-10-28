import { DAY_MS, lagosDay, lagosHour } from "@/lib/time";
import type { Analytics, Range, Signup } from "@/types/waitlist";

// Pure analytics over the waitlist rows (no I/O), so it is fully unit-tested.

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON_TO_SUN = [1, 2, 3, 4, 5, 6, 0];

export function parseRange(value: string | string[] | undefined): Range {
  const v = Number(Array.isArray(value) ? value[0] : value);
  return v === 7 || v === 90 ? v : 30;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** `rows` must be newest first. */
export function buildAnalytics(rows: Signup[], range: Range, now = Date.now()): Analytics {
  const perDay = new Map<string, number>();
  const perSource = new Map<string, { count: number; surveyed: number }>();
  const weekday = Array<number>(7).fill(0);
  const hour = Array<number>(24).fill(0);
  let surveyed = 0;

  for (const row of rows) {
    const day = lagosDay(row.created_at);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
    if (row.did_survey) surveyed++;
    const source = row.source?.trim() || "direct";
    const entry = perSource.get(source) ?? { count: 0, surveyed: 0 };
    entry.count++;
    if (row.did_survey) entry.surveyed++;
    perSource.set(source, entry);
    weekday[new Date(`${day}T12:00:00Z`).getUTCDay()]++;
    hour[lagosHour(row.created_at)]++;
  }

  // Lagos has no daylight saving, so stepping back in 24h blocks gives exact calendar days.
  const lastDays = (n: number) =>
    Array.from({ length: n }, (_, i) => lagosDay(new Date(now - (n - 1 - i) * DAY_MS)));
  const count = (day: string) => perDay.get(day) ?? 0;
  const sum = (days: string[]) => days.reduce((total, d) => total + count(d), 0);

  const doubled = lastDays(range * 2);
  const k30 = lastDays(30);
  const k21 = lastDays(21);
  const k14 = k21.slice(7);
  let running = rows.length - sum(k30);

  return {
    total: rows.length,
    surveyed,
    surveyRate: rows.length ? round1((100 * surveyed) / rows.length) : 0,
    today: count(k14[13]),
    yesterday: count(k14[12]),
    last7: sum(k14.slice(7)),
    prev7: sum(k21.slice(7, 14)),
    avgPerDay: round1(sum(k30) / 30),
    rangeTotal: sum(doubled.slice(range)),
    rangePrev: sum(doubled.slice(0, range)),
    daily: doubled.slice(range).map((day) => ({ day, count: count(day) })),
    spark: k14.map(count),
    cumulative: k30.map((d) => (running += count(d))),
    sources: [...perSource].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.count - a.count),
    weekdays: MON_TO_SUN.map((d) => ({ label: WEEKDAYS[d], count: weekday[d] })),
    hours: hour.map((c, h) => ({ label: `${String(h).padStart(2, "0")}:00`, count: c })),
    recent: rows.slice(0, 8),
  };
}
