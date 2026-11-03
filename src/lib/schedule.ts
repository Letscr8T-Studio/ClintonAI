// Send later: the quick picks, in the writer's own clock, and how a chosen time is shown.

export type ScheduleOptionId = "laterToday" | "tomorrowMorning" | "tomorrowAfternoon" | "monday";
export type ScheduleOption = { id: ScheduleOptionId; at: Date };

/** `days` from now at `hour`:00, local time. */
function at(now: Date, days: number, hour: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/**
 * Later today (18:00, until 17:00), tomorrow at 08:00 and 13:00, and next Monday at 08:00 (unless
 * tomorrow is Monday, which "Tomorrow morning" already covers).
 */
export function scheduleOptions(now: Date): ScheduleOption[] {
  const options: ScheduleOption[] = [];
  if (now.getHours() < 17) options.push({ id: "laterToday", at: at(now, 0, 18) });
  options.push({ id: "tomorrowMorning", at: at(now, 1, 8) });
  options.push({ id: "tomorrowAfternoon", at: at(now, 1, 13) });
  const toMonday = (8 - now.getDay()) % 7 || 7;
  if (toMonday > 1) options.push({ id: "monday", at: at(now, toMonday, 8) });
  return options;
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "Today 18:00", "Tomorrow 08:00", "Mon 9 Nov, 08:00": when a scheduled email will leave. */
export function formatWhen(date: Date, now = new Date()): string {
  const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
  if (sameDay(date, now)) return `Today ${time}`;
  if (sameDay(date, at(now, 1, 0))) return `Tomorrow ${time}`;
  const day = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
  return `${day.format(date)}, ${time}`;
}

/** The value a datetime-local input needs ("2026-11-03T08:00"), in local time. */
export function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
