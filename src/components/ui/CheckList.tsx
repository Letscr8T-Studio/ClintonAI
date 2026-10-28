import { palette } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Check } from "./icons";

/** Bulleted list with brand check marks. */
export function CheckList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-2.5 p-0", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[15px] text-body">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-tint">
            <Check size={11} color={palette.brand} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Bulleted list with small dots, e.g. AI check warnings. */
export function DotList({
  items,
  className,
  dotClassName = "bg-amber-dot",
}: {
  items: readonly string[];
  className?: string;
  dotClassName?: string;
}) {
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-2 p-0", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className={cn("mt-[0.45em] size-1.5 shrink-0 rounded-full", dotClassName)}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
