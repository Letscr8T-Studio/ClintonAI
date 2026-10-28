import { formatLagos } from "@/lib/time";
import type { Signup } from "@/types/waitlist";
import { Avatar, SurveyChip } from "../Indicators";
import { SignupRow } from "../SignupRow";

/** List on phones, table from tablet up. */
export function SignupsResults({ rows }: { rows: Signup[] }) {
  if (rows.length === 0) return <p className="py-12 text-center text-sm text-muted">No signups match.</p>;

  return (
    <>
      <ul className="mt-4 divide-y divide-line sm:hidden">
        {rows.map((r) => (
          <SignupRow key={r.id} signup={r} className="py-3" />
        ))}
      </ul>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Waitlist signups</caption>
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="py-2.5 pr-3 font-medium">
                Email
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Source
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Joined (Lagos)
              </th>
              <th scope="col" className="py-2.5 pl-3 font-medium">
                Survey
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line transition last:border-0 hover:bg-brand-wash">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <Avatar email={r.email} />
                    <span className="max-w-[18rem] truncate font-semibold">{r.email}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="rounded-lg bg-paper px-2 py-1 text-xs font-medium text-body ring-1 ring-line-strong">
                    {r.source || "direct"}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-body">{formatLagos(r.created_at)}</td>
                <td className="py-3 pl-3">
                  <SurveyChip done={r.did_survey} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
