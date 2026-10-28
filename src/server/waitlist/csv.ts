import { formatLagos } from "@/lib/time";
import type { Signup } from "@/types/waitlist";

/** Quotes a CSV field and defuses spreadsheet formulas (=, +, -, @) in user-supplied text. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Signups as a CSV file body, with a BOM so Excel reads UTF-8 correctly. */
export function signupsToCsv(rows: Signup[]): string {
  const lines = [
    "email,source,joined (Africa/Lagos),did_survey",
    ...rows.map((r) =>
      [
        csvCell(r.email),
        csvCell(r.source ?? ""),
        csvCell(formatLagos(r.created_at)),
        r.did_survey ? "yes" : "no",
      ].join(","),
    ),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}
