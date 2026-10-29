import { NextResponse, type NextRequest } from "next/server";
import { appRoutes } from "@/config/routes";
import type { ConnectOutcome } from "@/types/accounts";
import { connectGoogleAccount } from "@/server/accounts/service";
import { getCurrentUser } from "@/server/auth/user";
import { exchangeCode } from "@/server/google/oauth";
import { OAUTH_COOKIE, OAUTH_COOKIE_PATH, decodeOAuthState, stateMatches } from "@/server/google/oauth-state";

// Google → here with a one-time code. Checks state and user, exchanges the code (with the PKCE
// verifier), stores the refresh token in Vault, and returns home with the outcome.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const saved = decodeOAuthState(request.cookies.get(OAUTH_COOKIE)?.value);

  const finish = (outcome: ConnectOutcome) => {
    const home = new URL(appRoutes.home, request.url);
    home.searchParams.set("gmail", outcome);
    const response = NextResponse.redirect(home);
    response.cookies.set(OAUTH_COOKIE, "", { path: OAUTH_COOKIE_PATH, maxAge: 0 });
    return response;
  };

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(appRoutes.login, request.url));

  // access_denied when the user backs out of Google's consent screen.
  if (searchParams.get("error")) return finish("cancelled");

  const code = searchParams.get("code");
  if (!code || !saved || !stateMatches(saved, searchParams.get("state"), user.id)) return finish("failed");

  try {
    const redirectUri = new URL(appRoutes.gmailCallback, request.url).toString();
    const tokens = await exchangeCode(code, saved.verifier, redirectUri);
    return finish(await connectGoogleAccount(user.id, tokens));
  } catch (error) {
    console.error("Gmail connect failed", error instanceof Error ? error.message : error);
    return finish("failed");
  }
}
