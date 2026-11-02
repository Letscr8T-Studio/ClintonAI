// Home (signed-in): hero, getting-started steps and the Smart Delay ring. Dashboard copy: dashboard.ts.

import { appRoutes } from "@/config/routes";

export type SetupStepId = "connect" | "send" | "safe-send";
export type SetupStep = { id: SetupStepId; title: string; body: string; href?: string };

export const homeCopy = {
  eyebrow: (firstName: string | null) => (firstName ? `Welcome, ${firstName}` : "Welcome"),
  title: "Every send,",
  accent: "a safe one.",
  body: "Connect your Gmail and Clinton checks, holds and protects every email you send through Clinton AI.",
  /** Once Gmail is connected there is nothing to connect: just the promise. */
  bodyConnected: "Clinton checks, holds and protects every email you send through Clinton AI.",
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
      href: appRoutes.compose,
    },
    {
      id: "safe-send",
      title: "Try Safe Send",
      body: "Turn it on in Compose to send something you can withdraw for 24 hours.",
      href: appRoutes.compose,
    },
  ] as SetupStep[],
  delay: {
    caption: "Smart Delay",
    change: "Change",
    changeLabel: "Change your Smart Delay",
    body: (minutes: string) => `Every email waits ${minutes} before it leaves.`,
    off: "Smart Delay is off. Emails leave as soon as you send them.",
  },
};

/** Home once the user has sent an email: a compact header, so the numbers come first. */
export const returningCopy = {
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    neutral: "Welcome back",
  },
  title: (greeting: string, firstName: string | null) => (firstName ? `${greeting}, ${firstName}` : greeting),
  delay: (clock: string) => `Smart Delay ${clock}`,
  delayOff: "Smart Delay off",
  delayLabel: "Change your Smart Delay",
  write: "Write an email",
};

export const appShellCopy = {
  navLabel: "Main",
  tabsLabel: "Main navigation",
  nav: [
    { label: "Home", href: appRoutes.home, icon: "home" },
    { label: "Compose", href: appRoutes.compose, icon: "compose" },
    { label: "Outbox", href: appRoutes.outbox, icon: "outbox" },
    { label: "Settings", href: appRoutes.settings, icon: "settings" },
  ],
  accountMenu: "Account",
  signedInAs: "Signed in as",
  signOut: "Sign out",
};
