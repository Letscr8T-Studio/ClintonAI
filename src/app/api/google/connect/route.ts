import { NextResponse, type NextRequest } from "next/server";
import { appRoutes } from "@/config/routes";
import { getCurrentUser } from "@/server/auth/user";
import { buildConsentUrl } from "@/server/google/oauth";
import {
  OAUTH_COOKIE,
  createOAuthState,
  encodeOAuthState,
  oauthCookieOptions,
  pkceChallenge,
} from "@/server/google/oauth-state";

// "Connect Gmail" (POST from a form, so links and prefetches can't start it): remember a state and
// PKCE verifier for this user, then send them to Google's consent screen.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(appRoutes.login, request.url), 303);

  const saved = createOAuthState(user.id);
  const consentUrl = buildConsentUrl({
    state: saved.state,
    challenge: pkceChallenge(saved.verifier),
    redirectUri: new URL(appRoutes.gmailCallback, request.url).toString(),
    loginHint: user.email,
  });

  const response = NextResponse.redirect(consentUrl, 303);
  response.cookies.set(OAUTH_COOKIE, encodeOAuthState(saved), oauthCookieOptions);
  return response;
}
