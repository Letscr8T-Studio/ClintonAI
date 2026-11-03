// Date and time formatting. The founders work in Lagos (UTC+1, no daylight saving),
// so the console reports days and hours in that zone.

export const FOUNDERS_TZ = "Africa/Lagos";
export const DAY_MS = 86_400_000;

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: FOUNDERS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: FOUNDERS_TZ,
  dateStyle: "medium",
  timeStyle: "short",
});
const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: FOUNDERS_TZ,
  hour: "numeric",
  hourCycle: "h23",
});

/** "2026-10-23", the calendar day in Lagos. */
export function lagosDay(date: Date | string): string {
  return dayFormat.format(typeof date === "string" ? new Date(date) : date);
}

/** Hour of day (0-23) in Lagos. */
export function lagosHour(date: Date | string): number {
  return Number(hourFormat.format(typeof date === "string" ? new Date(date) : date));
}

export function formatLagos(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return formatLagos(iso).split(",")[0];
}

/** "23 Oct" for a "2026-10-23" day key. */
export function shortDay(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** "Fri 23 Oct" for a "2026-10-23" day key. */
export function longDay(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function greeting(date = new Date()): string {
  const h = lagosHour(date);
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** "04:59" from a number of seconds. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Time left, compactly: "18h 42m", "42m", "under a minute". */
export function formatTimeLeft(ms: number): string {
  if (ms < 60_000) return "under a minute";
  const minutes = Math.floor(ms / 60_000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** A countdown that also reads well for days: "04:59", "3h 05m", "2d 4h". */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 3600) return formatClock(s);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}
