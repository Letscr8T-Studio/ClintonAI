import Link from "next/link";
import { consoleButton } from "../styles";

type Props = { page: number; pages: number; total: number; href: (page: number) => string };

export function Pagination({ page, pages, total, href }: Props) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm"
    >
      <span className="text-muted">
        {total.toLocaleString()} result{total === 1 ? "" : "s"} · page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} rel="prev" className={consoleButton}>
            <span aria-hidden="true">←</span> Prev
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} rel="next" className={consoleButton}>
            Next <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
