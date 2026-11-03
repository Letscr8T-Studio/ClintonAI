# Architecture

## Principle

Everything runs through **one Next.js app** on Vercel. Browsers, the (future) Chrome extension and Safe
Send recipients all talk to it. **Only its server code touches the database, email providers, AI
models and payment APIs.** Secrets live on the server and in Supabase Vault, never in the browser or
the extension.

```
 Web app (any browser)   Chrome extension (Phase 3)   Recipient (Safe Send link)
            \                     |                        /
             v                    v                       v
   +-----------------------------------------------------------------+
   | Next.js on Vercel                                               |
   |  app pages (RSC)  |  API route handlers (server only)  |  /m/*  |
   +-----------------------------------------------------------------+
             | reads/writes                         | sends, checks, bills
             v                                      v
   Supabase: Postgres + RLS, Auth,          Gmail API (gmail.send), MS Graph (later),
   Storage (encrypted Safe Send),           Claude API (AI check + drafting),
   Vault (OAuth tokens), pg_cron            Inngest/QStash (Phase 2), Paddle/Paystack,
                                            Sentry
```

## Stack

| Concern             | Choice                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework           | Next.js 16 App Router, React 19, TypeScript (strict)                                                                                                 |
| Styling             | Tailwind CSS v4 with design tokens in `src/styles/tokens.css`                                                                                        |
| Data, auth, storage | Supabase (Postgres + row-level security, Auth, Storage, Vault, pg_cron)                                                                              |
| Validation          | zod 4 at every boundary (`src/lib/validation/`, `src/server/env.ts`)                                                                                 |
| Email sending       | Gmail API `gmail.send` scope (Phase 1); Microsoft Graph `Mail.Send` (Phase 4)                                                                        |
| AI                  | Claude: a Haiku-class model for fast checks, a Sonnet-class model for drafting; structured JSON output. Check current model IDs before implementing. |
| Timed jobs          | pg_cron for Smart Delay dispatch and Safe Send expiry; Inngest or QStash for outreach (Phase 2)                                                      |
| Payments            | Paddle (international), Paystack (naira), Phase 2                                                                                                    |
| Monitoring          | Sentry; PostHog or Vercel Analytics                                                                                                                  |
| Tests               | Vitest + Testing Library + axe-core; Playwright e2e                                                                                                  |
| Hosting             | Vercel; domain tryclinton.com                                                                                                                        |

## Code layers

```
app/          Routes. Thin: read params, call server/ or render components. No business logic.
components/   UI. May import content/, config/, lib/, types/. NEVER server/.
content/      Typed copy and sample data. No React, no logic.
config/       Site and brand constants.
lib/          Pure, isomorphic helpers. Safe in browser and server. No secrets, no I/O except browser.ts.
server/       `import "server-only"`. Env, Supabase admin client, auth, rate limits, repositories.
types/        Shared types (Database schema type, domain types).
```

Dependency direction: `app → components → (content, config, lib, types)` and `app → server → (lib, types)`.
`server/waitlist/analytics.ts` and `csv.ts` are pure (no `server-only`) so they can be unit-tested,
but they are still only imported from server code.

## Request flows today

- **Connect Gmail (Phase 1):** form `POST /api/google/connect` → random state + PKCE verifier in an
  httpOnly cookie bound to the user → Google consent (`openid email gmail.send`, offline) →
  `GET /api/google/callback` checks state and user → exchanges the code → `accounts/service`
  checks `gmail.send` was granted and reads the verified address from the ID token →
  `save_google_account()` stores the refresh token in Vault → `/dashboard?gmail=<outcome>`.
- **Send (test email today, Smart Delay later):** `accounts/service` → `get_account_refresh_token()` →
  Google token refresh (`invalid_grant` marks the account revoked) → `google/mime` builds the message
  → `google/gmail` sends from the user's own address.

- **Join waitlist:** `WaitlistForm` → `useWaitlist` → `POST /api/waitlist` → rate limit → zod parse →
  honeypot check → `repository.addToWaitlist` (upsert, duplicates ignored) → `{ ok: true }`.
- **Survey done:** Tally sends a signed webhook → `POST /api/webhooks/tally` (HMAC-SHA256 checked with `TALLY_SIGNING_SECRET`; reads the hidden `email` field) → `markSurveyDone` (only flips false → true).
- **Founders console:** `proxy.ts` checks the signed cookie for `/owner/*` and `/api/owner/*`; each page also calls `requireAdmin()`. Pages fetch via repositories and compute with pure `buildAnalytics()`. Errors render `(console)/error.tsx`.

## Data model today

`supabase/migrations/20261023000000_create_waitlist.sql`: table `waitlist` (id, email unique, source,
did_survey, survey_completed_at, created_at), RLS on with **no policies** (only the service role can
read/write), view `waitlist_stats`.

Phase 1 tables (`profiles`, `connected_accounts`, `emails`, `safe_send_messages`,
`safe_send_recipients`, `ai_check_events`, `activity_log`) are in place: users read their own rows
through RLS, the server writes with the service role, and triggers enforce the trust rules. Details in
the [Phase 1 plan](../phases/phase-1-safety-platform.md) (Data model). The Home dashboard reads
through `src/server/dashboard/repository.ts` as the user: `dashboard_stats(p_since)` (security
invoker, so RLS applies) for the four numbers, plus emails, linked `ai_check_events` and
`activity_log` for the lists.

Types: `src/types/supabase.gen.ts` is generated (`npm run db:types`); `src/types/database.ts`
re-exports it with friendly row names (`EmailRow`, `Profile`…). Import from `database.ts`.

Schema changes: add a new timestamped file in `supabase/migrations/`, never edit an applied one, add
pgTAP tests in `supabase/tests/database/`, then run `npm run test:db` and `npm run db:types`.

## Phase 1 additions (in progress)

See [phase-1-safety-platform.md](../phases/phase-1-safety-platform.md) for the data model, routes and
jobs. The database is built; architecturally the rest adds: Supabase Auth with Google, a `connected_accounts` table with tokens in
Vault, an `emails` state machine driven by pg_cron, encrypted Safe Send blobs in Storage, a public
recipient page under `/m/[token]`, an AI check service in `src/server/ai/`, and a signed-in app area
under `src/app/(app)/`.

The app shell (`src/app/(app)/layout.tsx`) sets `data-theme` from the `clinton-theme` cookie
(`src/server/theme.ts`) and mounts the command menu (`components/app/shell/CommandMenu.tsx`, keys in
`content/app/commands.ts`, matching in `lib/shortcuts.ts`). Colour tokens are `light-dark()` pairs,
so light and dark need no per-component code (see the decision log, 2 Nov 2026).

### Planned folder growth

```
src/app/(marketing)/      Landing and future public pages (move page.tsx here when a 2nd public page arrives)
src/app/(app)/            Signed-in product: dashboard, compose, outbox, sent, settings
src/app/m/[token]/        Safe Send recipient view (public, no login)
src/app/api/<domain>/     Route handlers per domain (emails, safe-send, check, cron)
src/components/app/       Product UI
src/server/<domain>/      repository.ts + service.ts per domain (emails, safe-send, ai, gmail)
```
