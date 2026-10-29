// Onboarding: a three-screen tour, then the default Smart Delay (Phase 1, user story 7).

export type TourVisual = "check" | "delay" | "safe-send";

export type TourStep = {
  id: TourVisual;
  label: string;
  title: string;
  accent: string;
  body: string;
  points: string[];
};

export const tourSteps: TourStep[] = [
  {
    id: "check",
    label: "AI check",
    title: "Clinton reads it",
    accent: "before they do.",
    body: "Press Send and Clinton looks for the mistakes people regret: the missing attachment, the wrong name, the accidental reply-all.",
    points: [
      "Each finding offers Fix it or Send anyway",
      "You always decide. Clinton never blocks a send",
      "Your email is checked, never stored",
    ],
  },
  {
    id: "delay",
    label: "Smart Delay",
    title: "A few minutes",
    accent: "to rethink it.",
    body: "Sent emails wait briefly in your Outbox before they leave. Until then, the recipient has nothing.",
    points: [
      "Edit, cancel or send now while it waits",
      "It goes from your own Gmail address",
      "It lands in your Gmail Sent folder, as usual",
    ],
  },
  {
    id: "safe-send",
    label: "Safe Send",
    title: "Take it back",
    accent: "for 24 hours.",
    body: "Turn on Safe Send for an email that matters. Recipients get a normal email from you with a link to read it.",
    points: [
      "Withdraw for everyone, or just one person",
      "Their page says it was withdrawn, by you, and when",
      "Chosen per email. Never on by default",
    ],
  },
];

export type DelayOption = { seconds: number; minutes: string; mood: string; recommended?: boolean };

export const delayOptions: DelayOption[] = [
  { seconds: 60, minutes: "1", mood: "Just a breath before it goes." },
  { seconds: 120, minutes: "2", mood: "Time for one quick second look." },
  {
    seconds: 300,
    minutes: "5",
    mood: "The sweet spot: catch the typo, never notice the wait.",
    recommended: true,
  },
  { seconds: 600, minutes: "10", mood: "Room to reread it with fresh eyes." },
  { seconds: 900, minutes: "15", mood: "Enough to cool off after a heated reply." },
  { seconds: 1800, minutes: "30", mood: "Maximum calm. Ideal for the big ones." },
];

export const onboardingCopy = {
  progressLabel: "Onboarding progress",
  progress: (step: number, total: number) => `Step ${step} of ${total}`,
  delayStepLabel: "Your delay",
  next: "Next",
  back: "Back",
  skip: "Skip the tour",
  delayTitle: "Choose your",
  delayAccent: "Smart Delay.",
  delayBody:
    "How long should sent emails wait before they leave? You can change it for any single email, or later in settings.",
  delayLegend: "Default delay, in minutes",
  minutesUnit: "min",
  recommended: "Recommended",
  optionLabel: (minutes: string, recommended?: boolean) =>
    `${minutes} min${recommended ? ", recommended" : ""}`,
  previewCaption: (minutes: string) => `Every email waits ${minutes} min before it leaves.`,
  finish: "Start using Clinton AI",
  finishing: "Saving…",
};
