import Link from "next/link";
import { appRoutes } from "@/config/routes";
import { historyCopy as copy } from "@/content/app/dashboard";
import { cn } from "@/lib/cn";

export type HistoryView = "caught" | "all";

const href = (view: HistoryView) =>
  view === "caught" ? `${appRoutes.activity}?view=caught` : appRoutes.activity;

/** The History page's two views, as links (so each has its own address and works without script). */
export function HistoryTabs({ current }: { current: HistoryView }) {
  return (
    <nav aria-label={copy.tabsLabel}>
      <ul className="m-0 inline-flex list-none gap-1 rounded-full border border-line bg-surface p-1">
        {(["caught", "all"] as const).map((view) => (
          <li key={view}>
            <Link
              href={href(view)}
              aria-current={view === current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center rounded-full px-4 text-sm font-semibold no-underline transition-colors",
                view === current ? "bg-night text-white" : "text-body hover:bg-paper",
              )}
            >
              {copy.tabs[view]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
