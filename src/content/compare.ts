import { sectionIds } from "./navigation";
import type { SectionCopy } from "./types";

/** true = yes, false = no, a string = shown as-is (e.g. "Soon", "24 hours"). */
export type CompareValue = boolean | string;

export const compareSection: SectionCopy = {
  id: sectionIds.compare,
  headingId: "cmp-h",
  pill: "Compare",
  title: "Undo Send gives you seconds.",
  accent: "Clinton gives you a day.",
};

export const compareColumns = { feature: "Feature", them: "Undo Send", us: "Clinton AI" };

export const compareRows: { feature: string; them: CompareValue; us: CompareValue }[] = [
  { feature: "Time to take it back", them: "~30 seconds", us: "24 hours" },
  { feature: "Works after it’s opened", them: false, us: true },
  { feature: "Removes attachments too", them: false, us: true },
  { feature: "AI check before sending", them: false, us: true },
  { feature: "Shows when it’s opened", them: false, us: true },
  { feature: "Writes and personalises emails", them: false, us: "Soon" },
  { feature: "Outreach with follow-ups", them: false, us: "Soon" },
];
