import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import type { SignupFilters } from "@/types/waitlist";
import { consoleButton, field } from "../styles";

/** GET form, so filters live in the URL and work without JavaScript. */
export function SignupsFiltersForm({ filters }: { filters: SignupFilters }) {
  const active = Boolean(filters.q) || filters.survey !== "all";
  return (
    <form method="get" action="/owner/signups" role="search" className="flex flex-col gap-2 sm:flex-row">
      <input
        type="search"
        name="q"
        defaultValue={filters.q}
        placeholder="Search by email"
        aria-label="Search by email"
        className={`min-w-0 flex-1 ${field}`}
      />
      <select
        name="survey"
        defaultValue={filters.survey}
        aria-label="Survey filter"
        className={`px-3 ${field}`}
      >
        <option value="all">All signups</option>
        <option value="yes">Did survey</option>
        <option value="no">Didn&apos;t do survey</option>
      </select>
      <button type="submit" className={buttonStyles({ shape: "soft", size: "sm" })}>
        Apply
      </button>
      {active && (
        <Link href="/owner/signups" className={consoleButton}>
          Clear
        </Link>
      )}
    </form>
  );
}
