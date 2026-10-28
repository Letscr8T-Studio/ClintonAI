import type { Metadata } from "next";
import { PageHeader } from "@/components/owner/Headings";
import { Pagination } from "@/components/owner/signups/Pagination";
import { parseSignupFilters, signupsHref } from "@/components/owner/signups/params";
import { SignupsFiltersForm } from "@/components/owner/signups/SignupsFilters";
import { SignupsResults } from "@/components/owner/signups/SignupsResults";
import { card, consoleButton } from "@/components/owner/styles";
import { Download } from "@/components/ui/icons";
import { requireAdmin } from "@/server/auth/guard";
import { PAGE_SIZE, searchSignups } from "@/server/waitlist/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Signups" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SignupsPage({ searchParams }: Props) {
  await requireAdmin();
  const filters = parseSignupFilters(await searchParams);
  const result = await searchSignups(filters);
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <>
      <PageHeader eyebrow="Everyone on the waitlist" title="Signups">
        {/* Plain <a>: this is a file download from an API route, not a page navigation. */}
        <a href="/api/owner/export" className={consoleButton}>
          <Download />
          Export CSV
        </a>
      </PageHeader>

      <div className={`${card} p-4 sm:p-5`}>
        <SignupsFiltersForm filters={filters} />
        <SignupsResults rows={result.rows} />
        <Pagination
          page={Math.min(filters.page, pages)}
          pages={pages}
          total={result.total}
          href={(p) => signupsHref(filters, p)}
        />
      </div>
    </>
  );
}
