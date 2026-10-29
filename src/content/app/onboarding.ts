// Onboarding: a three-screen tour, then the default Smart Delay (Phase 1, user story 7).

export type TourStep = { id: string; eyebrow: string; title: string; body: string; points: string[] };

export const tourSteps: TourStep[] = [
  {
    id: "ai-check",
    eyebrow: "AI check",
    title: "Clinton reads it before they do",
    body: "When you press Send, Clinton checks for the mistakes people regret: a missing attachment, the wrong name, an accidental reply-all.",
    points: [
      "Each finding offers Fix it or Send anyway",
      "You always decide; Clinton never blocks a send",
      "Your email text is checked, never stored",
    ],
  },
  {
    id: "smart-delay",
    eyebrow: "Smart Delay",
    title: "A few minutes to change your mind",
    body: "Sent emails wait briefly in your Outbox before they leave. Until then, the recipient has nothing.",
    points: [
      "Edit, cancel or send now while it waits",
      "It goes from your own Gmail address",
      "It lands in your Gmail Sent folder",
    ],
  },
  {
    id: "safe-send",
    eyebrow: "Safe Send",
    title: "Take it back for 24 hours",
    body: "Turn on Safe Send for an email that matters. Recipients get a normal email from you with a link to view it.",
    points: [
      "Withdraw for everyone, or just one person",
      "The page then says it was withdrawn, by you, and when",
      "You choose it per email; it's never on by default",
    ],
  },
];

export const delayOptions: { seconds: number; label: string; hint?: string }[] = [
  { seconds: 60, label: "1 min" },
  { seconds: 120, label: "2 min" },
  { seconds: 300, label: "5 min", hint: "Recommended" },
  { seconds: 600, label: "10 min" },
  { seconds: 900, label: "15 min" },
  { seconds: 1800, label: "30 min" },
];

export const onboardingCopy = {
  progress: (step: number, total: number) => `Step ${step} of ${total}`,
  next: "Next",
  back: "Back",
  skip: "Skip the tour",
  delayTitle: "Choose your Smart Delay",
  delayBody:
    "How long should sent emails wait before they leave? You can change this for any email, or later in settings.",
  delayLegend: "Default delay",
  finish: "Start using Clinton AI",
  finishing: "Saving…",
};
