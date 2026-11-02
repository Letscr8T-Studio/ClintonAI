import { Check } from "@/components/ui/icons";
import { palette } from "@/config/brand";
import { settingsCopy } from "@/content/app/settings";

/** A plain account of what Clinton keeps and for how long (trust rules 6 and 7, in words). */
export function PrivacySummary() {
  return (
    <ul className="m-0 grid list-none gap-px overflow-hidden rounded-[28px] border border-line bg-line p-0 sm:grid-cols-2">
      {settingsCopy.privacy.items.map((item) => (
        <li key={item.label} className="flex gap-3 bg-surface p-5">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand"
          >
            <Check size={10} color={palette.white} />
          </span>
          <p className="m-0">
            <span className="block text-sm text-muted">{item.label}</span>
            <span className="mt-0.5 block text-[15px] font-semibold text-ink">{item.value}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
