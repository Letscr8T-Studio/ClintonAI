# Environment, setup and deploy

## Environment variables

| Variable                               | Scope  | Required | Purpose                                                                            |
| -------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | public | prod     | Canonical URL, sitemap, social cards. Default `https://tryclinton.com`             |
| `NEXT_PUBLIC_TALLY_FORM_ID`            | public | yes      | Tally survey form ID (`tally.so/r/XXXXXX`)                                         |
| `NEXT_PUBLIC_SUPABASE_URL`             | public | app      | Supabase URL for user sign-in. Local: `http://127.0.0.1:54721`                     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | app      | Publishable key (`sb_publishable_…`); RLS protects the data. Set at **build** time |
| `SUPABASE_URL`                         | server | yes      | Supabase project URL                                                               |
| `SUPABASE_SERVICE_ROLE_KEY`            | server | yes      | Service-role key. **Never** prefix with `NEXT_PUBLIC_`                             |
| `ADMIN_EMAILS`                         | server | console  | Comma-separated founder emails                                                     |
| `ADMIN_PASSWORD`                       | server | console  | Shared console password (long, unique)                                             |
| `ADMIN_SESSION_SECRET`                 | server | console  | ≥32 random chars; `openssl rand -base64 32`. Rotating it logs everyone out         |
| `GOOGLE_CLIENT_ID`                     | server | app      | Same OAuth client as sign-in; used by "Connect Gmail"                              |
| `GOOGLE_CLIENT_SECRET`                 | server | app      | Its secret. Server only                                                            |
| `AI_PROVIDER`                          | server | optional | `openai`. Unset: the AI check runs the rules only                                  |
| `OPENAI_API_KEY`                       | server | with AI  | OpenAI key (`sk-…`). Server only                                                   |
| `OPENAI_MODEL`                         | server | no       | Default `gpt-5.4-mini`. Keep it fast: the model has a 2.5 s budget                 |

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

`/owner/login` (not linked from the site). Signs in with an `ADMIN_EMAILS` address and
`ADMIN_PASSWORD`; session lasts 7 days. Pages: Overview (`/owner/dashboard`), Signups (search,
filter, CSV export), Analytics (sources, weekday, hour; Lagos time).

## Deploy (Vercel)

1. Import the GitHub repo in Vercel (framework auto-detected).
2. Add every server and public env var under Project → Settings → Environment Variables.
3. Add `tryclinton.com` under Domains and set the DNS records shown.
4. Every push to `main` deploys; PRs get preview URLs.

After deploying, check: `/robots.txt`, `/sitemap.xml`, `/opengraph-image` render; social preview with a
card validator; Lighthouse ≥ 95 for accessibility and SEO.

## Checking numbers without the console

```sql
select * from waitlist_stats;
```
