# Environment, setup and deploy

## Environment variables

| Variable                    | Scope  | Required | Purpose                                                                    |
| --------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | public | prod     | Canonical URL, sitemap, social cards. Default `https://tryclinton.com`     |
| `NEXT_PUBLIC_TALLY_FORM_ID` | public | yes      | Tally survey form ID (`tally.so/r/XXXXXX`)                                 |
| `SUPABASE_URL`              | server | yes      | Supabase project URL                                                       |
| `SUPABASE_SERVICE_ROLE_KEY` | server | yes      | Service-role key. **Never** prefix with `NEXT_PUBLIC_`                     |
| `ADMIN_EMAILS`              | server | console  | Comma-separated founder emails                                             |
| `ADMIN_PASSWORD`            | server | console  | Shared console password (long, unique)                                     |
| `ADMIN_SESSION_SECRET`      | server | console  | ≥32 random chars; `openssl rand -base64 32`. Rotating it logs everyone out |

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
