# Phase 1: v1 safety platform (launch product)

**Status:** In progress (started 2026-10-28). **Gate to Phase 2:** Google verification
approved and the beta is used weekly.

## Goal

A signed-in web app at tryclinton.com where a user connects Gmail and sends email through Clinton AI
with three protections: **AI check**, **Smart Delay**, **Safe Send** (withdrawable for 24 h), plus a
**dashboard** of what they sent and what was caught. Private beta, ≤100 users from the waitlist.

## Out of scope

Reading the inbox (no restricted scopes), outreach, extension, Outlook, mobile, payments, teams.

## User stories (acceptance criteria)

1. **Connect:** I click Continue with Google, approve _only_ "send email on my behalf", and land on my dashboard in under 2 minutes.
2. **Compose and check:** I write an email; on Send, within ~2 s I see "N things to check" (or nothing). Each finding has Fix it / Send anyway. I can always send.
3. **Smart Delay:** after Send, the email sits in my Outbox with a countdown (my default delay, 1-30 min). I can edit, cancel or send now. If I do nothing it sends from my own address and appears in my Gmail Sent folder.
4. **Safe Send:** I can toggle Safe Send per email (off by default; suggested on risky emails). Recipients get a normal email from me with a "View message from [Name]" card; the link opens the content without login.
5. **Unsend:** for 24 h I can withdraw for everyone or one recipient. Their page then reads "This message was withdrawn by the sender at [time]". After 24 h, content is deleted automatically.
6. **Dashboard:** I see sent this month, mistakes caught, Safe Send opened, can still unsend; a table of emails with status and unsend window; a "caught before sending" list.
7. **Onboarding tour:** three screens: AI check, Smart Delay, Safe Send. Default delay chosen during onboarding.

## Data model (new migration files)

All tables: RLS on, `user_id = auth.uid()` policies, `created_at timestamptz default now()`.

| Table                  | Key columns                                                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`             | `user_id` PK → auth.users, `display_name`, `avatar_url`, `default_delay_seconds` (default from testing), `open_tracking` bool, `onboarded_at`                                                                                                                                          |
| `connected_accounts`   | `id`, `user_id`, `provider` ('google'), `email`, `scopes` text[], `vault_secret_id` (refresh token in Vault), `status` ('active','revoked','error')                                                                                                                                    |
| `emails`               | `id`, `user_id`, `account_id`, `subject`, `to`/`cc`/`bcc` jsonb, `body_ciphertext` (only while held), `safe_send` bool default false, `status` enum ('held','sending','sent','cancelled','failed'), `send_at`, `sent_at`, `provider_message_id`, `findings_count`, `findings_accepted` |
| `safe_send_messages`   | `id`, `email_id`, `storage_path` (encrypted blob), `key_ref`, `expires_at` (sent_at + 24 h), `withdrawn_at`, `content_deleted_at`                                                                                                                                                      |
| `safe_send_recipients` | `id`, `message_id`, `recipient_email`, `token_hash` (sha256 of the link token), `first_opened_at`, `open_count`, `withdrawn_at`                                                                                                                                                        |
| `ai_check_events`      | `id`, `user_id`, `email_id`, `finding_types` text[], `accepted` int, `dismissed` int. **No email text** (trust rule 7)                                                                                                                                                                 |
| `activity_log`         | `id`, `user_id`, `email_id`, `action` ('held','sent','cancelled','withdrawn','expired'), `at`                                                                                                                                                                                          |

Email status machine: `held → sending → sent` · `held → cancelled` · `sending → failed` (retry ×3 with backoff, then notify).
Safe Send: `sent → withdrawn (per recipient or all)` · `sent → expired (24 h, content deleted)`.

## Server modules

```
src/server/auth/          Supabase Auth session helpers (replaces founders password later)
src/server/google/        OAuth (gmail.send, offline access), token refresh via Vault, MIME builder, send
src/server/ai/            check-rules.ts (deterministic), check-model.ts (Claude, JSON schema), check.ts (merge)
src/server/emails/        repository.ts, service.ts (create/hold/cancel/sendNow/dispatch)
src/server/safe-send/     crypto.ts (AES-256-GCM, per-message key), repository.ts, service.ts (withdraw, expire, view)
```

## Routes

| Route                                                                   | Purpose                                                                             |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `GET /auth/callback`                                                    | Supabase/Google OAuth callback; stores refresh token in Vault                       |
| `POST /api/check`                                                       | AI check: rules + model; returns findings. Text not stored                          |
| `POST /api/emails`                                                      | Create and hold (`send_at = now + delay`)                                           |
| `POST /api/emails/[id]/cancel` · `/send-now` · `PATCH /api/emails/[id]` | Outbox actions while held                                                           |
| `POST /api/safe-send/[id]/withdraw`                                     | Body `{ recipient?: string }`                                                       |
| `GET /m/[token]`                                                        | Public recipient page (content, withdrawn notice, or expired notice); records opens |
| `POST /api/cron/dispatch` · `/api/cron/expire`                          | Called by pg_cron (via `pg_net`) with a shared secret header                        |

## AI check

Deterministic rules first (fast, free, explainable): attachment mentioned but none; greeting name vs
recipient name; >N recipients or reply-all; weekday/date mismatch; sensitive patterns (account numbers,
passwords, salary); external domains; unfilled merge fields `{…}`. Then the model for subtle issues
(tone, wrong-recipient-for-topic, contradictions, unfinished sentences) via the Claude API with a
strict JSON schema. Use a fast Haiku-class model; confirm the current model ID and structured-output
API before implementing. Timeout ~2.5 s; on timeout return rule findings only. Never block sending.

## Milestones

1. [ ] Migrations + types + RLS tests (Supabase local).
2. [ ] Supabase Auth with Google; `(app)` layout; onboarding (default delay, tour).
3. [ ] Gmail connect (`gmail.send`, offline) + Vault token storage + send a plain email.
4. [ ] Compose UI + AI check (rules → model) + findings card.
5. [ ] Smart Delay: Outbox, countdown, edit/cancel/send-now, pg_cron dispatcher.
6. [ ] Safe Send: encryption, storage, recipient page `/m/[token]`, card email template, withdraw, expiry job.
7. [ ] Dashboard (stats, table, caught list) + activity history.
8. [ ] Hardening: every item in the [launch checklist](../launch-checklist.md) (shared rate limits, CSP, signed Tally webhook, real console auth, Sentry), plus privacy policy + Limited Use page and terms.
9. [ ] Human + AI security review of auth, tokens, encryption. Deliverability tests (Gmail, Outlook, Yahoo spam folders).
10. [ ] Google verification submission (demo video, scope justifications). Invite beta in batches.

## Open decisions

- Default Smart Delay value (from beta testing).
- Supabase Auth Google provider vs a separate OAuth client for `gmail.send` offline tokens (Auth's provider token is short-lived).
- Attachment size limit for Safe Send and storage cost.
- Optional one-time code for very sensitive Safe Send emails: in v1 or later?
