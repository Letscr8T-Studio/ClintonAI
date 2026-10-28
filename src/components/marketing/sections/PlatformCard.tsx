import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PlatformPillar } from "@/content/platform";
import { cn } from "@/lib/cn";
import { platformVisuals } from "../visuals/platform";

// Static class names so Tailwind can see them.
const spans = {
  2: "min-[900px]:col-span-2",
  3: "min-[900px]:col-span-3",
  4: "min-[900px]:col-span-4",
};

/** One product pillar: number, status, illustration, title, description and feature tags. */
export function PlatformCard({ pillar }: { pillar: PlatformPillar }) {
  const { num, title, body, points, status, visual, span, dark = false } = pillar;
  const Visual = platformVisuals[visual];

  return (
    <li
      className={cn(
        "flex flex-col gap-5 rounded-[28px] border p-[clamp(20px,2.4vw,28px)]",
        dark ? "border-ink bg-ink text-white" : "border-line bg-white text-ink",
        spans[span],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("font-mono text-[13px]", dark ? "text-brand-soft" : "text-brand")}>{num}</span>
        <StatusBadge status={status} dark={dark} />
      </div>
      <div aria-hidden="true">
        <Visual />
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <h3 className="m-0 font-display text-[clamp(22px,2.2vw,26px)] leading-[1.15] font-bold tracking-[-0.02em]">
          {title}
        </h3>
        <p className={cn("m-0 text-[15px] leading-[1.6]", dark ? "text-navy-text" : "text-muted")}>{body}</p>
        <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0" aria-label={`${title} features`}>
          {points.map((point) => (
            <li
              key={point}
              className={cn(
                "rounded-full px-2.5 py-1 text-[12.5px]",
                dark ? "bg-white/10 text-white" : "bg-brand-wash text-body",
              )}
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
