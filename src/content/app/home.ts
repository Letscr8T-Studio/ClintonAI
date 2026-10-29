// Home (signed-in): hero, getting-started steps and the Smart Delay card.

import { appRoutes } from "@/config/routes";

export type SetupStepId = "connect" | "send" | "safe-send";

export const homeCopy = {
  eyebrow: (firstName: string | null) => (firstName ? `Welcome, ${firstName}` : "Welcome"),
  title: "Every send,",
  accent: "a safe one.",
  body: "Connect your Gmail and Clinton checks, holds and protects every email you send through Clinton AI.",
  progress: (done: number, total: number) => `${done} of ${total}`,
  progressLabel: (done: number, total: number) => `${done} of ${total} steps done`,
  stepsTitle: "Getting started",
  stepStatus: { done: "Done", next: "Next up", soon: "Coming next" },
  steps: [
    { id: "connect", title: "Connect Gmail", body: "Clinton sends from your own address." },
    {
      id: "send",
      title: "Send your first email",
      body: "Write it here. Clinton checks it, then holds it for your Smart Delay.",
    },
    { id: "safe-send", title: "Try Safe Send", body: "Send something you can take back for 24 hours." },
  ] satisfies { id: SetupStepId; title: string; body: string }[],
  soonNote: "Compose and Safe Send arrive in the next beta update.",
  delay: {
    caption: "Smart Delay",
    body: (minutes: string) => `Every email waits ${minutes} before it leaves.`,
  },
};

export const appShellCopy = {
  navLabel: "Main",
  nav: [{ label: "Home", href: appRoutes.home }],
  accountMenu: "Account",
  signedInAs: "Signed in as",
  signOut: "Sign out",
};
