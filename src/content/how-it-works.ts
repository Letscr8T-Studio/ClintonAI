import { sectionIds } from "./navigation";
import type { SectionCopy } from "./types";

export type StepVisual = "connect" | "check" | "unsend";

export const howItWorksSection: SectionCopy = {
  id: sectionIds.how,
  headingId: "how-h",
  pill: "How it works",
  title: "Three steps.",
  accent: "Zero regret.",
  description: "Keep writing email the way you always have. Clinton works quietly in the background.",
};

export const steps: { num: string; title: string; body: string; visual: StepVisual }[] = [
  {
    num: "01",
    title: "Connect your Gmail",
    body: "Sign in with Google. Clinton only gets permission to send for you. It never reads your inbox.",
    visual: "connect",
  },
  {
    num: "02",
    title: "Write. Clinton checks it.",
    body: "Wrong name, missing file, risky reply-all. It flags, you decide. Then it waits a moment before sending.",
    visual: "check",
  },
  {
    num: "03",
    title: "Take it back any time",
    body: "Changed your mind within 24 hours? One click and it's gone from their side, even if they opened it.",
    visual: "unsend",
  },
];

export const stepSamples = {
  connect: { button: "Continue with Google", permission: "Permission: send email only" },
  check: { warnings: ["Wrong name: David → Daniel", "Attachment missing"] },
  unsend: { time: "23:59:12", action: "Unsend" },
};
