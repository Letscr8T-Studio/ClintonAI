# Product vision

Source: _Clinton AI: Product Vision, Features and Build Plan_ (Oct 28, 2026, @Preye). This file is the
canonical, versioned copy. When the plan changes, change it here.

## Overview

Clinton AI is an AI email copilot that helps people write, personalise, send safely and follow up,
inside the inbox they already use. It starts as an email safety layer and grows into a full assistant
for everyday email and personalised outreach.

**One line:** never regret an email again.

What it does, in short:

- **Catches mistakes before they leave:** an AI check flags the wrong name, the missing attachment, the risky reply-all and sensitive data.
- **Gives you a way back:** Smart Delay holds an email for a few minutes you choose; Safe Send lets you withdraw an email for up to 24 hours, even after it is opened.
- **Writes with you:** drafts, rewrites, replies and personalised outreach, sent from your own Gmail or Outlook address.
- **Keeps you on top of email:** follow-up reminders, priorities and summaries.
- **Guards AI-sent email:** a review layer for emails that AI agents and bots send on someone's behalf.

**Origin.** An email to a company's investors went out with a major error; the 30-second undo had
passed and the sender nearly lost their job. Almost everyone who uses email for work has a version of that story.

**Positioning.** The big email-safety companies (Zivver, Virtru, Egress) sell to banks, hospitals and
governments through IT teams. Clinton AI is for individuals, founders, freelancers and small teams who
want the same protection: set up in two minutes, priced for normal people, open worldwide from day one
(main marketing focus: US, UK, Europe, Canada; Nigerian users equally welcome).

## The problem

Email is the official channel for work, and one wrong click can cost a client, a deal or a job.

What goes wrong: wrong recipient or reply-all; "please see attached" with nothing attached; wrong name,
typo, wrong price or date; sent before it was ready or in anger; confidential data to the wrong place;
mail-merge mistakes like "Hi {first_name}".

Why existing fixes fall short: Gmail Undo Send is ~30 seconds before the email leaves; Outlook Recall
mostly only works inside one organisation; Gmail warns about missing attachments but nothing checks the
wider set of mistakes, and nothing helps after delivery.

**Evidence:** people search "how to unsend an email" (re-check current volumes before quoting);
companies pay for this (Zivver acquired by Kiteworks June 2025, Egress by KnowBe4 2024, Virtru);
early founder-community interest. **Still to prove:** whether individuals and small teams will pay.
The waitlist survey's willingness-to-pay questions are the test.

## Who it is for

| Segment                             | Worst email moment                          | Needs most                          |
| ----------------------------------- | ------------------------------------------- | ----------------------------------- |
| Founders and startup teams          | Investor update with last quarter's numbers | AI check, Safe Send                 |
| Sales and business development      | Proposal with another client's name         | Outreach, personalisation, AI check |
| Agency owners and consultants       | Invoice to the wrong client                 | AI check, Safe Send, templates      |
| Remote professionals and assistants | Reply-all that should have been private     | AI check, Smart Delay               |
| Freelancers                         | Quote missing a zero                        | AI check, writing help              |
| Job seekers and students            | Application to the wrong company            | AI check, writing help              |
| Builders running AI agents          | Bot email that went out wrong               | Review window, guardrails API       |

**Not for (yet):** large regulated organisations needing enterprise compliance. Later, once certified.

## How email works, and what is possible

Nobody can delete an email from someone else's inbox, and Clinton AI never tries. Three mechanisms:

1. **Prevention (AI check)** runs when the user hits Send and flags likely mistakes. Never blocks.
2. **Hold (Smart Delay):** the email waits in Clinton AI's Outbox for a delay the user chooses (~1-30 min). Edit, cancel or send now. Until it leaves, the recipient has nothing.
3. **Withdrawable delivery (Safe Send):** delivered instantly from the sender's own address, but body and attachments live encrypted on Clinton AI's servers. The email shows a card with "View message". For 24 hours the sender can withdraw; the page then says "This message was withdrawn by the sender at [time]".

Safe Send emails are **not** held for 24 hours. They arrive immediately; 24 hours is only the withdrawal window.
Details of what Safe Send can and cannot do: [features.md](features.md#safe-send-can-and-cannot).

## Competitors

| Product                             | What it does                                                  | Gap Clinton AI fills                                      |
| ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| Zivver                              | Secure email, recall, error prevention (orgs, Workspace only) | Personal Gmail, solo sign-up                              |
| Virtru                              | Encryption, revoke, expiry (regulated industries)             | Everyday users, simple pricing, writing help              |
| Egress                              | AI stops misdirected email (enterprise via IT)                | Individuals and small teams                               |
| Gmail Undo Send / Confidential mode | Seconds of delay; little-known revocation                     | A full day, AI check, visible product                     |
| Gemini in Gmail                     | AI writing inside Gmail                                       | Cross-provider; safety and outreach                       |
| Apollo, Instantly, Lemlist          | Lead databases, bulk cold email                               | No blasting; personal outreach that never embarrasses you |

**How we win:** for everyone (not IT), prevention plus a way back in one product, AI that suggests Safe
Send for risky emails, phone-friendly, global from day one, ready for AI agents.

## Objections and answers

Use these consistently on the site, in posts and in conversation (the site FAQ lives in `src/content/faq.ts`).

- _"You can't delete an email from someone's inbox."_ Correct, and we never do. Only the content behind a Safe Send email can be withdrawn.
- _"So emails wait 24 hours?"_ No. Delivered instantly; 24 hours is the withdrawal window. Smart Delay is a separate short hold.
- _"Changeable emails lose legal value."_ We never edit a delivered email; only withdraw, always visibly. Send contracts normally.
- _"Isn't this avoiding accountability?"_ It's a correction tool, like deleting a WhatsApp message: visible, not a cover-up.
- _"Gmail already warns about attachments."_ We check much more: names, recipients, reply-all, sensitive data, dates, tone.
- _"Do recipients need Clinton AI?"_ No app, no sign-up.
- _"Is my data safe?"_ Planned: encrypted Safe Send content deleted at window close; AI-checked text not stored; GDPR, CCPA, NDPA. **Describe as plans until built and reviewed.**
- _"Is this Apollo / cold email?"_ No lead lists, no blasting. Personal emails to people you choose, from your own inbox.
