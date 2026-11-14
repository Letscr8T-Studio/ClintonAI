// Paths of the signed-in product. Keep src/proxy.ts's matcher in step when adding an app route.

export const appRoutes = {
  login: "/login",
  home: "/dashboard",
  compose: "/compose",
  outbox: "/outbox",
  /** Everything Clinton caught and every email action, beyond what Home shows. */
  activity: "/activity",
  settings: "/settings",
  onboarding: "/onboarding",
  /** Founders console (admins only, with a second step). */
  owner: "/owner/dashboard",
  ownerMfa: "/owner/mfa",
  authCallback: "/auth/callback",
  signOut: "/auth/signout",
  gmailConnect: "/api/google/connect",
  gmailCallback: "/api/google/callback",
} as const;

/** Signed-in pages: the proxy sends visitors without a session to the login page. */
export const protectedPrefixes = [
  appRoutes.home,
  appRoutes.compose,
  appRoutes.outbox,
  appRoutes.activity,
  appRoutes.settings,
  appRoutes.onboarding,
  "/owner",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
