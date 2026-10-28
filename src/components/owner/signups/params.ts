import type { SignupFilters } from "@/types/waitlist";

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads and sanitises the signups page query string. */
export function parseSignupFilters(sp: RawParams): SignupFilters {
  const survey = first(sp.survey);
  return {
    q: first(sp.q).trim().slice(0, 100),
    survey: survey === "yes" || survey === "no" ? survey : "all",
    page: Math.max(1, Math.floor(Number(first(sp.page))) || 1),
  };
}

/** URL for a page of results that keeps the current filters. */
export function signupsHref(filters: SignupFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.survey !== "all") params.set("survey", filters.survey);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/owner/signups${qs ? `?${qs}` : ""}`;
}
