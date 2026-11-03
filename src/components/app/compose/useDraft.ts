"use client";

import { useState } from "react";
import type { DraftFields, ExtraRows, FieldErrors } from "./ComposeFields";
import { emptyDraft } from "./validate";

const rowsFor = (v: DraftFields): ExtraRows => ({ cc: v.cc !== "", bcc: v.bcc !== "" });

/** The email being written: its fields, their errors, and which of Cc / Bcc are showing. */
export function useDraft(initial: DraftFields, onEdit: () => void) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [rows, setRows] = useState(() => rowsFor(initial));

  /** A user edit: clears that field's error, and tells the check its result is out of date. */
  const change = (field: keyof DraftFields, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }));
    onEdit();
  };

  /** Starts over with these fields (empty after sending; the email back after Undo). */
  const load = (fields: DraftFields = emptyDraft) => {
    setValues(fields);
    setErrors({});
    setRows(rowsFor(fields));
  };

  const showRow = (row: keyof ExtraRows) => setRows((r) => ({ ...r, [row]: true }));

  return { values, setValues, errors, setErrors, rows, change, load, showRow };
}
