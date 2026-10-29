// Paths of the signed-in product. Keep src/proxy.ts's matcher in step when adding an app route.

export const appRoutes = {
  login: "/login",
  home: "/dashboard",
  compose: "/compose",
  onboarding: "/onboarding",
  authCallback: "/auth/callback",
  signOut: "/auth/signout",
  gmailConnect: "/api/google/connect",
  gmailCallback: "/api/google/callback",
} as const;

/** Signed-in pages: the proxy sends visitors without a session to the login page. */
export const protectedPrefixes = [appRoutes.home, appRoutes.compose, appRoutes.onboarding] as const;

export function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
