import type { RuleHit } from "./types";

// "Monday, 3 November" when 3 November is a Tuesday. Handles "Mon 3rd Nov", "Monday, November 3",
// with or without a year. With no year, the date is taken as the next occurrence.

const WEEKDAYS: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WEEKDAY =
  "(sunday|sun|monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat)";
const MONTH =
  "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const DAY = "(\\d{1,2})(?:st|nd|rd|th)?";
const YEAR = "(?:,?\\s+(\\d{4}))?";

// Weekday then day-month ("Monday 3 November") or month-day ("Monday, November 3").
const DAY_FIRST = new RegExp(
  `\\b${WEEKDAY}\\.?,?\\s+(?:the\\s+)?${DAY}(?:\\s+of)?\\s+${MONTH}\\b\\.?${YEAR}`,
  "gi",
);
const MONTH_FIRST = new RegExp(`\\b${WEEKDAY}\\.?,?\\s+${MONTH}\\.?\\s+${DAY}\\b${YEAR}`, "gi");

function resolveYear(month: number, day: number, year: string | undefined, now: Date): number {
  if (year) return Number(year);
  const thisYear = now.getUTCFullYear();
  const candidate = Date.UTC(thisYear, month, day);
  // More than 30 days in the past: they mean next year.
  return candidate < now.getTime() - 30 * 86_400_000 ? thisYear + 1 : thisYear;
}

function check(weekday: string, dayText: string, monthText: string, year: string | undefined, now: Date) {
  const month = MONTHS.indexOf(monthText.slice(0, 3).toLowerCase());
  const day = Number(dayText);
  const named = WEEKDAYS[weekday.toLowerCase()];
  if (month < 0 || named === undefined || day < 1 || day > 31) return null;

  const y = resolveYear(month, day, year, now);
  const date = new Date(Date.UTC(y, month, day));
  if (date.getUTCMonth() !== month) return null; // 31 June and similar: not a real date
  const actual = date.getUTCDay();
  if (actual === named) return null;
  return {
    actual: DAY_NAMES[actual]!,
    date: `${day} ${date.toLocaleString("en-GB", { month: "long", timeZone: "UTC" })} ${y}`,
  };
}

export function findDateMismatches(body: string, now = new Date()): RuleHit[] {
  const hits: RuleHit[] = [];
  for (const m of body.matchAll(DAY_FIRST)) {
    const result = check(m[1]!, m[2]!, m[3]!, m[4], now);
    if (result) hits.push({ type: "date_mismatch", field: "body", excerpt: m[0].trim(), params: result });
  }
  for (const m of body.matchAll(MONTH_FIRST)) {
    const result = check(m[1]!, m[3]!, m[2]!, m[4], now);
    if (result) hits.push({ type: "date_mismatch", field: "body", excerpt: m[0].trim(), params: result });
  }
  return hits;
}
