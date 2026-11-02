import { z } from "zod";

/** Appearance of the signed-in app. "system" follows the device's light or dark setting. */
export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const themeSchema = z.enum(THEMES);

/** Saved per device (a phone can be dark while a laptop stays light), for a year. */
export const THEME_COOKIE = "clinton-theme";
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

/** Reads a stored value; anything unknown falls back to following the device. */
export function parseTheme(value: string | undefined): Theme {
  const parsed = themeSchema.safeParse(value);
  return parsed.success ? parsed.data : "system";
}

/** The next theme when cycling from the command menu or the T shortcut. */
export function nextTheme(theme: Theme): Theme {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]!;
}
