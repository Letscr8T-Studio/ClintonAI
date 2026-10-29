// The AI check: what is checked, and what a finding looks like. Shared by the rules (pure),
// the model call (server) and the findings UI.

export type DraftEmail = {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  /** File names. Compose has no attachments yet, so this is empty until Safe Send. */
  attachments: string[];
};

export type RuleType =
  | "missing_attachment"
  | "greeting_mismatch"
  | "many_recipients"
  | "date_mismatch"
  | "sensitive_data"
  | "placeholder"
  | "empty_subject";

/** Categories the model may report. Kept small so the UI can label them. */
export const MODEL_TYPES = ["tone", "contradiction", "unfinished", "recipient", "clarity", "other"] as const;
export type ModelType = (typeof MODEL_TYPES)[number];

export type FindingField = "to" | "subject" | "body";

/** What a rule found. Wording comes from src/content/app/compose.ts. */
export type RuleHit = {
  type: RuleType;
  field: FindingField;
  /** The exact text to highlight, when there is one. */
  excerpt?: string;
  params?: Record<string, string | number>;
};

export type Finding = {
  id: string;
  source: "rules" | "model";
  type: RuleType | ModelType;
  field: FindingField;
  message: string;
  excerpt?: string;
};

export type CheckResult = {
  findings: Finding[];
  /** False when the model was skipped, timed out or failed; rule findings still apply. */
  modelUsed: boolean;
};
