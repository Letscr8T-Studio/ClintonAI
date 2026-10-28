import type { WaitlistRow } from "./database";

/** A waitlist signup as the founders console shows it. */
export type Signup = Pick<WaitlistRow, "id" | "email" | "source" | "did_survey" | "created_at">;

export type SurveyFilter = "all" | "yes" | "no";

export type SignupFilters = { q: string; survey: SurveyFilter; page: number };

export type Range = 7 | 30 | 90;
export const RANGES: readonly Range[] = [7, 30, 90];

export type Analytics = {
  total: number;
  surveyed: number;
  surveyRate: number;
  today: number;
  yesterday: number;
  last7: number;
  prev7: number;
  /** Average over the last 30 days. */
  avgPerDay: number;
  rangeTotal: number;
  rangePrev: number;
  /** `range` days, oldest first. */
  daily: { day: string; count: number }[];
  /** Last 14 days. */
  spark: number[];
  /** Last 30 days, running total. */
  cumulative: number[];
  sources: { source: string; count: number; surveyed: number }[];
  /** Mon..Sun. */
  weekdays: { label: string; count: number }[];
  /** 00:00..23:00, Lagos time. */
  hours: { label: string; count: number }[];
  recent: Signup[];
};
