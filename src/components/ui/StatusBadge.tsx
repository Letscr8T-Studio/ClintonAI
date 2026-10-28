import { cn } from "@/lib/cn";
import type { Availability } from "@/content/types";
import { Chip } from "./Chip";

const LABELS: Record<Availability, string> = { live: "Live at launch", soon: "Coming soon" };

/** "Live at launch" / "Coming soon" badge. Keep claims honest: only Phase 1 features are "live". */
export function StatusBadge({ status, dark = false }: { status: Availability; dark?: boolean }) {
  if (status === "live") {
    return (
      <Chip tone="brand" dot className="self-start text-[11.5px]">
        {LABELS.live}
      </Chip>
    );
  }
  return (
    <Chip
      tone="outline"
      dot
      className={cn("self-start text-[11.5px]", dark && "border-white/25 text-navy-text")}
    >
      {LABELS.soon}
    </Chip>
  );
}
