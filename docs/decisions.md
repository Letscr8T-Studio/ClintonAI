# Decision log

Short records of decisions that shape the codebase. Newest first. Add an entry whenever you make a
choice a future engineer might question. Format: date, decision, why, consequences.

## 2026-10-29: "Connect Gmail" is its own OAuth step; tokens live in Vault

- **Decision:** Gmail sending is granted through our own OAuth flow, separate from sign-in, asking only for `gmail.send` (+ `openid email` to learn the address). PKCE and a state cookie bound to the signed-in user protect the round trip; `prompt=consent` guarantees a refresh token. The token is stored with `vault.create_secret` through a security-definer function only the service role can call; no one else, not even the owner, can read it. Disconnect revokes at Google (best effort) and deletes the row, and a trigger destroys the secret.
- **Why:** Supabase Auth does not keep Google refresh tokens, and Smart Delay must send after the user has left. Least privilege: no read scopes, so no restricted-scope security assessment.
- **Consequences:** Google's granular consent lets users untick `gmail.send`; we detect it and explain. `invalid_grant` on refresh marks the account revoked and the UI offers Reconnect. Dev must use the local Supabase for server-side writes.

## 2026-10-29: Sign-in with Supabase Auth + Google, server-side only

- **Decision:** "Continue with Google" via Supabase Auth, run entirely on the server: a server action starts OAuth (PKCE verifier in a cookie), `/auth/callback` exchanges the code, `@supabase/ssr` keeps the session in httpOnly cookies, and `src/proxy.ts` refreshes it on app routes. No Supabase client code ships to the browser. Sign-in requests only `email profile`; Gmail sending is a separate, later consent.
- **Why:** Least privilege and a smaller attack surface; users understand "sign in" and "let Clinton send" as different asks. Server-side PKCE avoids tokens in client JS.
- **Consequences:** User-facing reads go through `getSupabaseForUser()` (RLS applies). The `next` parameter is always passed through `safeNextPath` (no open redirects). Google credentials live in `supabase/.env` locally and in the Supabase dashboard when hosted, never in the app env.

## 2026-10-28: Phase 1 database: clients read, server writes, triggers guard the trust rules

- **Decision:** Signed-in users only SELECT their own rows (RLS + column grants that hide ciphertext, token references and link hashes). All writes go through server routes with the service role, after zod validation. The trust rules that can be expressed in data (withdraw never edit, permanent withdrawals, 24 h window, email lifecycle, body wiped after send, append-only history, no AI-check text column) are enforced by triggers and constraints, and proven by pgTAP tests.
- **Defaults:** Smart Delay 5 min (range 1-30 min); open tracking off until the user turns it on (opens are a guess; privacy first).
- **Why:** A bug in the app or a stolen user token cannot break a promise the database refuses to break.
- **Consequences:** New tables follow the same pattern. Types are generated (`src/types/supabase.gen.ts`), never hand-written; CI checks they match. Local Supabase uses ports 547xx.

## 2026-10-28: Phase 1 starts now; survey gate waived

- **Decision:** Start building the Phase 1 safety platform now, as the product plan states ("Phase 1 is the launch product and the only one built now"). The Phase 0 "survey shows people will pay" gate does not block it.
- **Why:** Founder decision. Survey results remain useful research for pricing and Phase 2/3 order, but the launch product is committed.
- **Consequences:** The launch checklist (docs/launch-checklist.md) is still a hard gate before real users connect Gmail.

## 2026-10-28: New logo, the "Held C"

- **Decision:** Replace the C + sparkle mark with the "Held C" (a C holding the send in its mouth) and set the wordmark as "Clinton AI" in one typeface. Chosen over a check-C and a way-back C.
- **Why:** The sparkle is generic AI imagery and smeared at 16 px; the arrow version read as a browser reload icon. The Held C is ownable, ties to Smart Delay, and stays legible in a browser tab.
- **Consequences:** One geometry file (`src/config/logo-mark.json`) feeds every logo surface; `npm run icons` regenerates the favicon files. A real `favicon.ico` exists again, so browsers stop showing the cached Unsend icon. See [brand.md](product/brand.md#logo).

## 2026-10-28: Rebrand to Clinton AI and production restructure

- **Decision:** The product is Clinton AI (tryclinton.com). "Unsend" becomes the take-back feature name. Codebase restructured into `src/` with layers `app → components → content/config/lib/types` and `app → server`.
- **Why:** The product grew from a single feature into a seven-pillar email copilot; the code needed to scale phase by phase with many contributors and AI agents.
- **Consequences:** Founders console cookie renamed (`clinton_owner`): founders sign in again once. Waitlist "already joined" flag moved to `clinton-waitlist-email`; the old `unsend-waitlist-email` key is still read. Old `favicon.ico`/`apple-icon.png` replaced with the Clinton AI mark (`icon.svg`, generated `apple-icon`).

## 2026-10-28: Content lives in `src/content/`

- **Decision:** All marketing copy and sample data are typed TS modules, not JSX literals and not a CMS.
- **Why:** One place to edit copy; type-checked; testable (anchors, duplicates, banned claims). A CMS is premature at this stage.
- **Consequences:** Components take data from content files. Revisit a CMS when non-engineers edit copy weekly.

## 2026-10-28: Testing stack

- **Decision:** Vitest + Testing Library + axe-core for unit/component/a11y; Playwright for e2e; GitHub Actions CI.
- **Why:** Fast, ESM-native, works with React 19 and Next 16; axe gives an objective accessibility gate.

## 2026-10-28: Validation with zod at every boundary

- **Decision:** API bodies and server env are parsed with zod 4.
- **Consequences:** In zod 4, keys using `z.unknown().transform()` must add `.optional()` first, or a missing key fails with a generic error (see `src/lib/validation/waitlist.ts`).

## 2026-10-28: Analytics "vs prior week" fix

- **Decision:** `prev7` now compares the last 7 days with days 7-13 ago. Previously it compared with days 14-20 ago.
- **Consequences:** The console's "Last 7 days" change badge may show different numbers than before. Covered by `analytics.test.ts`.

## 2026-10-23: Supabase + service-role-only access for the waitlist

- **Decision:** Waitlist table has RLS with no policies; only server routes (service role) access it.
- **Why:** Nobody can read the list from the browser.

## 2026-10-23: Founders console with shared password

- **Decision:** Env-configured allow-list + shared password + signed cookie.
- **Why:** Fastest safe option before the product has its own auth. Replace with Supabase Auth in Phase 1.
