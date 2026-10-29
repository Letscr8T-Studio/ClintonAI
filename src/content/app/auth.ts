// Copy for sign-in and the signed-in shell.

import { appRoutes } from "@/config/routes";

export const loginCopy = {
  title: "Sign in to Clinton AI",
  body: "Use the Google account you send email from. Signing in only shares your name and email address.",
  button: "Continue with Google",
  pending: "Opening Google…",
  privacy: "Clinton AI can't read your inbox. Sending permission is asked for separately, later.",
};

/** Keys arrive as `/login?error=<key>`; anything else shows the generic message. */
export const loginErrors = {
  cancelled: "Sign-in was cancelled. Try again when you're ready.",
  callback: "We couldn't finish signing you in. Please try again.",
  oauth: "We couldn't reach Google. Please try again.",
} as const;

export type LoginErrorKey = keyof typeof loginErrors;

export function loginErrorMessage(key: unknown): string | null {
  if (typeof key !== "string") return null;
  return Object.hasOwn(loginErrors, key) ? loginErrors[key as LoginErrorKey] : loginErrors.callback;
}

export const appShellCopy = {
  nav: [{ label: "Dashboard", href: appRoutes.home }],
  navLabel: "Main",
  signOut: "Sign out",
};

export const homeCopy = {
  greeting: (firstName: string | null) => (firstName ? `Welcome, ${firstName}` : "Welcome"),
  body: "Your dashboard fills up once you start sending through Clinton AI.",
  settingsTitle: "Your settings",
  delayLabel: "Smart Delay",
  trackingLabel: "Open tracking",
  trackingOn: "On",
  trackingOff: "Off",
};
