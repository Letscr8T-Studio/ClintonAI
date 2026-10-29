import { z } from "zod";

/** Smart Delay bounds in seconds. Mirrors the check in the profiles migration. */
export const SMART_DELAY = { min: 60, max: 1800, default: 300 } as const;

export const delaySecondsSchema = z.coerce
  .number({ message: "Choose a delay." })
  .int("Choose a delay.")
  .min(SMART_DELAY.min, "The shortest delay is 1 minute.")
  .max(SMART_DELAY.max, "The longest delay is 30 minutes.");

export const onboardingSchema = z.object({ delaySeconds: delaySecondsSchema });

/** The name recipients see in the From line. One plain line: no line breaks or angle brackets. */
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Add the name people should see.")
  .max(80, "Keep it under 80 characters.")
  .refine((v) => !/[\r\n<>]/.test(v), "Use letters, spaces and simple punctuation only.");

/** "5 min", "1 min", "30 min". Delays are whole minutes. */
export function formatDelay(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}
