# Environment, setup and deploy

## Environment variables

| Variable                                              | Scope  | Required | Purpose                                                                                                                        |
| ----------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `TALLY_SIGNING_SECRET`                                | server | webhook  | Tally form → Integrations → Webhooks → signing secret. Unset: `/api/webhooks/tally` answers 503                                |
| `NEXT_PUBLIC_SENTRY_DSN`                              | public | errors   | Sentry project DSN. Unset: Sentry is off                                                                                       |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | build  | errors   | Source map upload on build (Vercel only). Never sent to the browser                                                            |
| `RATE_LIMIT_STORE`                                    | server | limits   | Leave unset (limits shared through the database). `memory` is for unit tests only                                              |
| `NEXT_PUBLIC_SITE_URL`                                | public | prod     | Canonical URL, sitemap, social cards. Default `https://tryclinton.com`                                                         |
| `NEXT_PUBLIC_TALLY_FORM_ID`                           | public | yes      | Tally survey form ID (`tally.so/r/XXXXXX`)                                                                                     |
| `NEXT_PUBLIC_SUPABASE_URL`                            | public | app      | Supabase URL for user sign-in. Local: `http://127.0.0.1:54721`                                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                | public | app      | Publishable key (`sb_publishable_…`); RLS protects the data. Set at **build** time                                             |
| `SUPABASE_URL`                                        | server | yes      | Supabase project URL                                                                                                           |
| `SUPABASE_SERVICE_ROLE_KEY`                           | server | yes      | Service-role key. **Never** prefix with `NEXT_PUBLIC_`                                                                         |
| `GOOGLE_CLIENT_ID`                                    | server | app      | Same OAuth client as sign-in; used by "Connect Gmail"                                                                          |
| `GOOGLE_CLIENT_SECRET`                                | server | app      | Its secret. Server only                                                                                                        |
| `AI_PROVIDER`                                         | server | optional | `openai`. Unset: the AI check runs the rules only                                                                              |
| `OPENAI_API_KEY`                                      | server | with AI  | OpenAI key (`sk-…`). Server only                                                                                               |
| `EMAIL_ENCRYPTION_KEY`                                | server | app      | 32 bytes base64 (`openssl rand -base64 32`). Encrypts held email bodies. Back it up: losing it makes waiting emails unreadable |
| `APP_URL`                                             | server | app      | Base URL for links in emails (Safe Send). Dev `http://localhost:3000`; prod `https://tryclinton.com`                           |
| `CRON_SECRET`                                         | server | app      | 32+ chars. pg_cron sends it to `/api/cron/dispatch`; register it with `npm run db:dispatcher`                                  |
| `OPENAI_MODEL`                                        | server | no       | Default `gpt-5.4-mini`. Keep it fast: the model has a 6 s budget                                                               |

Server vars are validated by `src/server/env.ts`. A missing Supabase var fails the request that needs it
with a clear message; missing admin vars disable console login. Add every new var to this table,
`.env.example` and `env.ts`.

## Local setup

```bash
npm install
cp .env.example .env.local      # fill in values
npm run dev                     # http://localhost:3000
```

Node ≥ 20.9 (CI uses 22).

**Local database (Docker Desktop required):**

```bash
npm run db:start     # Postgres + Auth + Storage, applies supabase/migrations/
npm run test:db      # pgTAP tests in supabase/tests/database/
npm run db:types     # regenerate src/types/supabase.gen.ts after a migration
npm run db:reset     # wipe and re-apply all migrations
npm run db:stop
```

Local ports are **547xx** (API 54721, DB 54722, Studio 54723), set in `supabase/config.toml`. They
avoid the Supabase defaults (543xx, often used by other local projects) and the 54402-54601 range that
Windows/Hyper-V reserves. Check reserved ranges with `netsh interface ipv4 show excludedportrange protocol=tcp`.

**Hosted Supabase:** `npx supabase login`, `npx supabase link --project-ref <ref>`, then
`npx supabase db push` applies any migrations the project hasn't run yet. Copy the project URL and
service-role key into `.env.local`.

For local development point `NEXT_PUBLIC_SUPABASE_*` at the local stack (`npx supabase status`
prints the publishable key). Sign-in, profiles and every Phase 1 table live there.

**Smart Delay dispatcher:** pg_cron runs `invoke_dispatcher()` every 20 s, which POSTs to the URL stored in
Vault with `Authorization: Bearer <CRON_SECRET>`. Locally, run `npm run db:dispatcher` once (after
`db:start` or `db:reset`); it registers `http://host.docker.internal:3000/api/cron/dispatch` and the
`CRON_SECRET` from `.env.local`. Keep `npm run dev` on port 3000. Hosted: run the same script with the
project's `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` and
`DISPATCH_URL=https://tryclinton.com/api/cron/dispatch`.

**Google sign-in (Google Cloud project "Clinton AI"):**

- Google Auth Platform: External audience, **Testing** mode, test users listed under Audience.
  Scopes: `openid`, `userinfo.email`, `userinfo.profile`, `gmail.send` (sensitive: needs Google verification before launch).
- OAuth client "Clinton AI web (dev)", type Web application. Authorised origin
  `http://localhost:3000`; redirect URI `http://127.0.0.1:54721/auth/v1/callback` (local Supabase Auth).
- Its ID and secret go in **`supabase/.env`** (git-ignored), which `supabase start` reads:
  `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`.
  Restart with `npm run db:stop && npm run db:start` after changing them.
- Hosted: add `https://<project-ref>.supabase.co/auth/v1/callback` as a redirect URI and
  `https://tryclinton.com` as an origin on the same client, then paste the ID and secret into
  Supabase dashboard → Authentication → Providers → Google. In Authentication → URL Configuration set
  Site URL `https://tryclinton.com` and allow `https://tryclinton.com/auth/callback`.

**Connect Gmail** (separate consent, `gmail.send` only): the same client also needs the redirect URI
`http://localhost:3000/api/google/callback` (and `https://tryclinton.com/api/google/callback` in
production), and the app needs `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env.local`. In development,
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` must point at the **local** stack (`npx supabase status`),
because tokens are stored through it; never point dev at the live project.

Flow: `/login` → server action `signInWithGoogle` → Google → Supabase Auth → `/auth/callback`
(exchanges the code, sets cookies) → `/dashboard`, or `/onboarding` until it is finished. `src/proxy.ts`
refreshes the session on app routes.

**Tally:** add a Hidden field block named exactly `email`; remove the visible email question; publish
and copy the form ID.

## Founders console

`/owner` (not linked from the site). Founders sign in with the normal Google sign-in, must be in
the `admins` table, and must pass a second step with an authenticator app (TOTP MFA). Every visit
and export is written to `admin_access_log`. Pages: Overview (`/owner/dashboard`), Signups (search,
filter, CSV export), Analytics (sources, weekday, hour; Lagos time).

- **Add a founder:** they sign in to the product once, then `npm run admin:add -- them@example.com`
  (hosted: run the script with that project's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).
  Remove with `--remove`. On their next visit to `/owner` they scan a QR code to set up the app.
- **MFA must be on** in the hosted project: Supabase dashboard → Authentication → Multi-factor →
  TOTP enabled. Locally it's on in `supabase/config.toml` (restart Supabase after changing it).
- **Lost authenticator:** delete their factor in the Supabase dashboard (Authentication → Users →
  the user → MFA factors); they set up a new one on their next visit.

## Deploy (Vercel)

Follow the step-by-step **[deploy runbook](../deploy.md)**: Supabase (Frankfurt), Google Cloud, OpenAI,
Sentry, Vercel (Frankfurt, `vercel.json`), DNS at Hostinger, the dispatcher, founders' access.

- `npm run deploy:check-env -- .env.production.local` checks every production variable before it goes into Vercel.
- `npm run deploy:verify -- https://tryclinton.com` smoke-tests the live site: headers, CSP nonce, legal pages, locked routes, webhook and dispatcher refusals.

Every push to `main` deploys. Production variables are scoped to Production only, so previews can't
touch production data.

## Checking numbers without the console

```sql
select * from waitlist_stats;
```
