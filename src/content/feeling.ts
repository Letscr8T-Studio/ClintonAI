export type MomentFix = "aiCheck" | "unsend";

export const feeling = {
  headingId: "feel-h",
  pill: "You know the feeling",
  title: "The stomach drop,",
  accent: "two seconds after send.",
  body: "Everyone has one. The embarrassing reply. The follow-up apology. The email you still think about.",
  fixLabels: {
    aiCheck: "Caught by AI check",
    unsend: "Taken back with Unsend",
  } satisfies Record<MomentFix, string>,
  moments: [
    { text: "“Hi David,”", after: "His name is Daniel.", fix: "aiCheck" },
    { text: "“Please see attached.”", after: "Nothing was attached.", fix: "aiCheck" },
    { text: "Reply all.", after: "All 214 of them.", fix: "unsend" },
    { text: "Sent before it was ready.", after: "Half a sentence, to a client.", fix: "unsend" },
    { text: "The angry one at 1:47am.", after: "You meant to sleep on it.", fix: "unsend" },
    { text: "The wrong price in the quote.", after: "Missing a zero.", fix: "unsend" },
  ] satisfies { text: string; after: string; fix: MomentFix }[],
};
