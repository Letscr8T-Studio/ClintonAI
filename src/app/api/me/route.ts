import { NextResponse } from "next/server";
import type { Me } from "@/lib/validation/extension";
import { listAccounts } from "@/server/accounts/repository";
import { getCurrentUser } from "@/server/auth/user";
import { fail } from "@/server/http";
import { getProfile } from "@/server/profiles/repository";

// GET /api/me: who is signed in, for the Chrome extension. It calls with the tryclinton.com
// session cookie (the extension has host permission for the site), so signing out on the site
// signs the extension out too. Other websites can't read this: there are no CORS headers.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);

  const [profile, accounts] = await Promise.all([getProfile(user.id), listAccounts()]);
  const account = accounts.find((a) => a.status === "active") ?? accounts[0] ?? null;
  const me: Me = {
    ok: true,
    email: user.email,
    name: profile?.display_name ?? null,
    gmail: account ? { email: account.email, status: account.status } : null,
    defaultDelaySeconds: profile?.default_delay_seconds ?? 300,
  };
  return NextResponse.json(me, { headers: { "Cache-Control": "no-store" } });
}
