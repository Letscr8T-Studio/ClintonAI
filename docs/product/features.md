# Features and user flows

Seven pillars. Pillar 1 is the launch product (Phase 1); the rest are planned. See
[roadmap.md](roadmap.md) for when each lands. Landing-page copy for these lives in `src/content/platform.ts`.

## 1. Safety (Phase 1, launch)

- **AI check before sending.** Rules catch the obvious: attachment mentioned but none attached; greeting name not matching the recipient; large recipient list or reply-all; date not matching the weekday; account numbers, passwords or salary figures; external recipients. An AI model catches the subtle: wrong tone, a recipient who doesn't fit the topic, contradictions, unfinished sentences. Results: a small card ("2 things to check") with **Fix it** and **Send anyway**. Never blocks.
- **Smart Delay.** Personal Outbox with countdown. Edit, cancel or send now. Delay per user, per email, or by rule (e.g. longer for emails to investors).
- **Safe Send.** Withdrawable delivery for 24 hours. Switched on by the user, or suggested by the AI check for risky emails.
- **Read status** for Safe Send: delivered, opened (with time), withdrawn.
- **Withdraw for one recipient** or everyone.
- **Proof of delivery:** when each recipient opened it.
- **Activity history:** every email sent, held, cancelled or withdrawn.

### Safe Send: can and cannot

| Can                                                 | Cannot                                                     |
| --------------------------------------------------- | ---------------------------------------------------------- |
| Remove the body and attachments within 24 hours     | Remove the subject line or the email itself from the inbox |
| Show whether and when the recipient opened it       | Stop someone who opened it from taking a screenshot        |
| Withdraw for one recipient or all                   | Work for emails sent without Safe Send                     |
| Delete content automatically when the window closes | Edit a delivered message silently (never offered)          |

**Later:** AMP for Email (Gmail, Yahoo) can show live content in the inbox with no click; needs Google sender approval; Outlook unsupported, so the link view stays as fallback.

## 2. AI assistant in the inbox (planned)

Side panel in Gmail, Outlook and Yahoo web (via the extension) and in the app: write a reply; make it
politer, shorter, more formal; draft from a few words; summarise a thread in three lines; "What am I
behind on?"; find things fast; translate and adjust tone; learn the user's style.

## 3. Personalised outreach (Phase 2)

Users bring their own leads; Clinton AI never sells lead lists. Import (CSV, paste from Apollo, one by
one) → AI personalisation per lead (name, company, role, website, notes) → review queue (approve / edit /
skip) → sends from the user's Gmail/Outlook, spread through the day within safe limits → follow-ups
after N days, stopped on reply → reply sorting (interested / not now / unsubscribe) → pipeline view.
Mail-merge safety via the AI check. Compliance: unsubscribe link, do-not-contact list, address checking.

## 4. Inbox management (Phase 5)

Priority inbox, follow-up reminders ("You emailed Amaka 3 days ago…"), daily digest, one-click
unsubscribe, send at the best time, snooze. Requires restricted Gmail scopes and a CASA assessment.

## 5. Guardrails for AI agents (Phase 7)

An API that agents send through. Every email checked; risky ones held for human review or sent with a
withdrawal window. Rules ("never email more than 50 people", "never include prices", "hold every
external email 10 minutes"). Full logs.

## 6. Teams and business (Phase 8)

Shared templates and brand voice, admin rules ("salary files never leave the company"), roles, admin
dashboard, audit log, team inboxes, later SSO and SOC 2.

## 7. Reach

Gmail and Microsoft 365 first; Yahoo and custom domains next; Chrome extension then other browsers;
iOS and Android apps.

---

## Key user flows

**Onboarding (~2 min):** tryclinton.com → Continue with Google (or Microsoft) → approve one permission
(send email on my behalf) → choose default Smart Delay → three-screen tour (AI check, Smart Delay,
Safe Send) → optional Chrome extension.

**Writing and sending:** write in the app (or Gmail via extension) → optionally ask Clinton to draft or
rewrite → Send → AI check (1-2 s) → if issues, card with Fix it / Send anyway → Outbox with countdown
(edit, cancel, send now) → sends from the user's own address and appears in their Sent folder.

**Safe Send, recipient side:** email from the sender's address and subject → card with sender name and
photo, optional preview, **View message from [Name]** → clean page with message and attachments → no
login (optional one-time code for very sensitive emails) → footer "Sent with Clinton AI, so the sender
can correct mistakes."

**Withdrawing:** Sent list (delivered / opened at [time]) → **Unsend** (everyone or one recipient) →
recipient page shows "This message was withdrawn by the sender at [time]"; content deleted → after
24 h the window closes and content is deleted automatically.

**Outreach campaign (Phase 2):** create campaign → import leads → address check → brief → AI drafts per
lead → review queue → sends spread through the day → follow-ups unless replied → replies land in normal
inbox (user marks replied in v1; auto-detected later).

## User dashboard

Every user gets a dashboard: what they sent, what happened to it, what they can still take back, the
mistakes caught. Top row: "Sent this month", "Mistakes caught", "Safe Send opened", "Can still unsend".
Table: To, Subject, Status, Unsend window. Side panel: "Caught before sending".

- **Phase 1:** every email with status (in Smart Delay, sent, opened, not opened, withdrawn); live 24 h countdown + Unsend; mistakes caught with a monthly count.
- **Phase 2:** per-campaign sent / opened / clicked / replied, due follow-ups, review queue.
- **Phase 5:** auto reply detection, summaries, priority list, reminders.
- **Phase 8:** admin view across the team.

**"Opened": certain vs likely.** Safe Send opens are certain (the recipient must open our link). Normal
email opens come from a tracking pixel and are a guess (Apple Mail preloads, blockers hide). Label them
"Likely opened", never "Opened". Tracking is disclosed (GDPR, CCPA, NDPA) and can be switched off per
email or per account.
