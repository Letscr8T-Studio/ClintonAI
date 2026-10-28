import { Section, SectionHeading } from "@/components/ui/Section";
import { compareColumns, compareRows, compareSection, type CompareValue } from "@/content/compare";
import { cn } from "@/lib/cn";

const cellX = "px-3 min-[640px]:px-4";
const firstX = `${cellX} min-[640px]:px-[22px]`;

/** Shows ✓ / ✕ visually and "Yes" / "No" to screen readers. */
function Value({ value }: { value: CompareValue }) {
  if (typeof value === "string") return <>{value}</>;
  return (
    <>
      <span aria-hidden="true">{value ? "✓" : "✕"}</span>
      <span className="sr-only">{value ? "Yes" : "No"}</span>
    </>
  );
}

export function Compare() {
  const { id, headingId, ...heading } = compareSection;
  return (
    <Section id={id} labelledBy={headingId} width="medium">
      <SectionHeading id={headingId} {...heading} />
      <div className="anim-reveal overflow-hidden rounded-3xl border border-line bg-white">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm min-[640px]:text-[15px]">
          <caption className="sr-only">
            {compareColumns.them} compared with {compareColumns.us}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className={cn("border-b border-line py-[18px] text-left font-semibold text-muted", firstX)}
              >
                {compareColumns.feature}
              </th>
              <th
                scope="col"
                className={cn(
                  "w-[27%] border-b border-line py-[18px] text-center font-semibold text-muted min-[640px]:w-[22%]",
                  cellX,
                )}
              >
                {compareColumns.them}
              </th>
              <th
                scope="col"
                className={cn(
                  "w-[27%] bg-brand py-[18px] text-center font-bold text-white min-[640px]:w-[22%]",
                  cellX,
                )}
              >
                {compareColumns.us}
              </th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.feature} className="anim-row">
                <th
                  scope="row"
                  className={cn("border-b border-line-soft py-4 text-left font-medium text-ink", firstX)}
                >
                  {row.feature}
                </th>
                <td className={cn("border-b border-line-soft py-4 text-center text-subtle", cellX)}>
                  <Value value={row.them} />
                </td>
                <td
                  className={cn(
                    "border-b border-brand-line bg-brand py-4 text-center font-semibold text-white",
                    cellX,
                  )}
                >
                  <Value value={row.us} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
