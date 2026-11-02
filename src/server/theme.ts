import "server-only";
import { cookies } from "next/headers";
import { THEME_COOKIE, THEME_MAX_AGE, parseTheme, type Theme } from "@/lib/validation/theme";

/** This device's appearance choice. Read on the server, so the page never flashes the wrong theme. */
export async function getTheme(): Promise<Theme> {
  return parseTheme((await cookies()).get(THEME_COOKIE)?.value);
}

export async function setThemeCookie(theme: Theme): Promise<void> {
  (await cookies()).set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: THEME_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}
