import { z } from "zod";
import { formatClock } from "@/lib/time";

/**
 * Smart Delay bounds in seconds. Mirrors the check in the profiles migration.
 * 0 is "Off": the email leaves as soon as it is sent, with no chance to cancel.
 */
export const SMART_DELAY = { off: 0, min: 60, max: 1800, default: 300 } as const;

/** Off, or whole seconds from 1 to 30 minutes. An empty field is never read as Off. */
export const delaySecondsSchema = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.coerce
    .number({ message: "Choose a delay." })
    .int("Choose a delay.")
    .refine(
      (s) => s === SMART_DELAY.off || (s >= SMART_DELAY.min && s <= SMART_DELAY.max),
      "Choose Off, or a delay from 1 to 30 minutes.",
    ),
);

export const onboardingSchema = z.object({ delaySeconds: delaySecondsSchema });

/** The name recipients see in the From line. One plain line: no line breaks or angle brackets. */
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Add the name people should see.")
  .max(80, "Keep it under 80 characters.")
  .refine((v) => !/[\r\n<>]/.test(v), "Use letters, spaces and simple punctuation only.");

/** What a Smart Delay ring shows: "05:00", or "Off". */
export function delayClock(seconds: number): string {
  return seconds === SMART_DELAY.off ? "Off" : formatClock(seconds);
}

/** "5 min", "1 min", "30 min", or "Off". Delays are whole minutes. */
export function formatDelay(seconds: number): string {
  if (seconds === SMART_DELAY.off) return "Off";
  return `${Math.round(seconds / 60)} min`;
}
