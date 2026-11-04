# Deploy runbook: first production launch

Takes about two hours. Do the steps in order: later steps need values from earlier ones. Tick each
box as you go. Never paste a secret into chat, a doc, an issue or a commit. Keep them in your
password manager and in `.env.production.local` (git-ignored).

**Where things live:**

- Code: GitHub `Letscr8T-Studio/ClintonAI`.
- App: Vercel, London (`lhr1`, pinned in `vercel.json`).
- Database, sign-in and files: Supabase, London (`eu-west-2`). Keep it in the same city as Vercel.
- Domain: `tryclinton.com`, DNS at Hostinger (it shows a parked page today).

## 0. Before you start

- [ ] Accounts: Vercel, Supabase, Google Cloud, OpenAI, Sentry, Tally, and Hostinger (for DNS).
- [ ] Plans:
  - **Vercel Pro** is required: the Hobby plan doesn't allow commercial use.
  - **Supabase Pro** is recommended: free projects pause after a week without use and have no daily backups. Free is fine for a first private test.
  - Sentry's free plan is enough for the beta.
- [ ] Generate three secrets in Git Bash and save each in your password manager:
  ```bash
  openssl rand -base64 32   # EMAIL_ENCRYPTION_KEY (also back it up offline: losing it makes waiting emails unreadable)
  openssl rand -base64 32   # CRON_SECRET
  openssl rand -base64 24   # Supabase database password
  ```
- [ ] `cp .env.example .env.production.local`. You fill it in as you go and paste it into Vercel at step 6.

## 1. Supabase project

- [ ] **Create the project.** supabase.com → New project. Name `clinton-ai`, region **London (eu-west-2)**, and the database password from step 0.
- [ ] **Copy the API values.** Project Settings → API:
  - the Project URL goes into both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`;
  - the publishable key goes into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
  - the secret key goes into `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Apply the schema** from this repo:
  ```bash
  npx supabase link --project-ref <your-project-ref>
  npx supabase db push        # applies every file in supabase/migrations, in order
  ```
- [ ] **Check the schema.** Table Editor shows `profiles`, `emails`, `admins`… Storage shows the `safe-send` and `attachments` buckets, both **private**.
- [ ] **Authentication → Sign In / Providers:**
  - Turn **Google** on. Its client ID and secret come from step 2; come back then.
  - Turn **Email** off: Clinton AI only uses Google sign-in.
- [ ] **Authentication → URL Configuration:**
  - Site URL: `https://tryclinton.com`.
  - Redirect URLs: `https://tryclinton.com/auth/callback`.
- [ ] **Authentication → Multi-factor:** enable **TOTP (authenticator app)**. The founders console requires it.

## 2. Google Cloud (sign-in and Gmail sending)

- [ ] console.cloud.google.com → new project `Clinton AI` → **APIs & Services → Library → Gmail API → Enable**.
- [ ] **OAuth consent screen** (Google Auth Platform → Branding / Audience / Data access):
  - User type **External**; publishing status **Testing** until verification.
  - App name `Clinton AI`, support email, logo.
  - Home page `https://tryclinton.com`, privacy `https://tryclinton.com/privacy`, terms `https://tryclinton.com/terms`.
  - Authorised domains: `tryclinton.com` and `supabase.co`.
  - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/gmail.send`.
  - **Test users:** every beta tester's Gmail address. Google allows 100, ever, before verification: invite carefully.
- [ ] **Credentials → Create OAuth client ID** (Web application):
  - Authorised JavaScript origin: `https://tryclinton.com`.
  - Authorised redirect URIs, both of them:
    - `https://<your-project-ref>.supabase.co/auth/v1/callback` (sign-in);
    - `https://tryclinton.com/api/google/callback` (Connect Gmail).
  - Put the ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and paste them into Supabase → Google provider (step 1).

## 3. OpenAI

- [ ] platform.openai.com → a project `clinton-ai` → API key into `OPENAI_API_KEY`; set `AI_PROVIDER=openai` and `OPENAI_MODEL=gpt-5.4-mini`.
- [ ] Set a monthly budget limit on the project. Ask OpenAI for zero data retention (launch checklist).

## 4. Sentry (error tracking)

- [ ] sentry.io → new project, platform **Next.js** → DSN into `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] Organisation slug into `SENTRY_ORG`, project slug into `SENTRY_PROJECT`.
- [ ] Settings → Auth Tokens → a new organisation token into `SENTRY_AUTH_TOKEN`. It uploads source maps on each build.
- [ ] Alerts → keep the default "new issue" alert, emailing both founders.

## 5. Remaining values

- [ ] `NEXT_PUBLIC_SITE_URL=https://tryclinton.com` and `APP_URL=https://tryclinton.com`.
- [ ] `EMAIL_ENCRYPTION_KEY` and `CRON_SECRET` from step 0.
- [ ] Tally:
  - `NEXT_PUBLIC_TALLY_FORM_ID` is the survey's form ID.
  - The form → Integrations → Webhooks → add `https://tryclinton.com/api/webhooks/tally`, and put its signing secret into `TALLY_SIGNING_SECRET`.
- [ ] Remove any `ADMIN_*` or `RATE_LIMIT_STORE` lines.
- [ ] **Check everything:**
  ```bash
  npm run deploy:check-env -- .env.production.local
  ```
  Fix every ✗ before going on. Each ! is a warning to read.

## 6. Vercel

- [ ] Vercel → Add New → Project → import `Letscr8T-Studio/ClintonAI`. The framework, Next.js, is detected.
- [ ] Environment Variables: paste the whole `.env.production.local` (Vercel accepts a pasted `.env`), scoped to **Production** only.
  - Preview deployments then have no secrets and can't touch production data.
  - Give previews their own Supabase project later if you want working previews.
- [ ] Deploy. The build runs the type checks and uploads source maps to Sentry.
- [ ] Settings → Domains: add `tryclinton.com` and `www.tryclinton.com`, with www redirecting to the bare domain. Vercel shows the DNS records to create.

## 7. DNS at Hostinger

- [ ] Hostinger → Domains → `tryclinton.com` → DNS / Nameservers:
  - delete the parking `A` / `CNAME` records for `@` and `www`;
  - add exactly the records Vercel showed (usually `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`).
- [ ] Wait until Vercel shows both domains as **Valid** (minutes to a few hours). HTTPS is issued automatically.
- [ ] Email for `privacy@` and `support@tryclinton.com`, which the legal pages promise:
  - set up Hostinger email or a forwarder;
  - add the SPF, DKIM and DMARC records it gives you (they also help Safe Send cards stay out of spam).

## 8. Switch on the background jobs

The Smart Delay and Send later dispatcher is called by the database every 20 seconds. Tell it where
the app is (Git Bash, one line; the values come from `.env.production.local`):

- [ ] Run:
  ```bash
  SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<secret> CRON_SECRET=<secret> \
  DISPATCH_URL=https://tryclinton.com/api/cron/dispatch node scripts/configure-dispatcher.mjs
  ```
- [ ] Supabase → Integrations → Cron: `clinton-dispatch` runs every 20 s and `clinton-rate-limit-cleanup` runs hourly; recent runs succeed.

## 9. Founders console access

- [ ] Each founder signs in once at `https://tryclinton.com/login` (and must be a Google test user).
- [ ] Then run:
  ```bash
  SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<secret> node scripts/add-admin.mjs you@example.com
  ```
- [ ] Open `https://tryclinton.com/owner`, scan the QR code with an authenticator app and enter the code.

## 10. Verify

- [ ] Run the automatic check, which must pass all of its checks:
  ```bash
  npm run deploy:verify -- https://tryclinton.com
  ```
- [ ] **Sign-in and sending, by hand:**
  - sign in, connect Gmail, send yourself a test email from Home;
  - write an email with a PDF attached and "Likely opened" on, then send it to another address you own: it arrives with the file, and opening it shows "Likely opened";
  - schedule one for 5 minutes ahead and watch it leave;
  - Safe Send to a Gmail, an Outlook and a Yahoo address: the card lands in the **inbox, not spam**; open, then withdraw.
- [ ] **Errors:** in the browser console on the site, run `setTimeout(() => { throw new Error("Sentry test") })`. The error reaches Sentry with no email address in it.
- [ ] **Survey:** answer the Tally survey with a waitlisted email, and `did_survey` turns true in the console.
- [ ] **Console:** with the browser console open, use the site end to end. No `Content-Security-Policy` errors.
- [ ] Tick the matching boxes in [launch-checklist.md](launch-checklist.md). Beta invites wait until every box there is ticked, including the human security review.

## If something goes wrong

- **Bad deploy:** Vercel → Deployments → the last good one → **Promote to Production**. It takes seconds.
- **Database:** migrations only move forward. Never edit an applied migration; write a new one, then `npx supabase db push`.
- **Leaked secret:** rotate it at its source, update Vercel, redeploy.
  - `CRON_SECRET`: also re-run step 8.
  - `EMAIL_ENCRYPTION_KEY`: don't rotate while emails are waiting, or they become unreadable. Wait until the Outbox is empty.
- **Locked out of the console:** Supabase → Authentication → Users → you → delete your MFA factor, then set it up again.
