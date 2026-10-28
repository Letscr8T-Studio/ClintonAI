# Business model, go-to-market, metrics and risks

## Pricing (draft)

Monthly subscriptions with a free plan. Final prices wait for the survey's willingness-to-pay answers.

| Plan       | For                                | Includes                                                        | Draft price                            |
| ---------- | ---------------------------------- | --------------------------------------------------------------- | -------------------------------------- |
| Free       | Trying it out                      | AI check and Smart Delay with a monthly limit; a few Safe Sends | Free                                   |
| Pro        | Individuals, freelancers, founders | Unlimited AI check and Smart Delay, Safe Send, AI writing       | $4-7 or $8-15/month; USD, naira option |
| Outreach   | Sales and BD                       | Pro + campaigns, personalisation, follow-ups, pipeline          | [$__]/month with send limits           |
| Team       | Small teams, agencies              | Per seat: templates, admin rules, audit log                     | [$__]/user/month                       |
| Enterprise | Larger orgs                        | SSO, compliance, custom terms                                   | Custom, later                          |
| Agent API  | Builders running agents            | Pay per checked or held email                                   | [$__] per 1,000                        |

**Payments:** Paddle internationally (merchant of record, global sales tax), Paystack for naira.
**Principles:** annual discount, USD worldwide with regional discounts, free credits for early waitlist users who completed the survey.

## Go-to-market

**Validation (now):** landing page + waitlist + Tally survey, signups in Supabase, founders console.
Survey fixes: remove the email question (hidden field captures it), fix the duplicate option in Q9, add
conditional logic to Q14, add questions on email provider and AI agents sending email. Tag every
shared link (`?ref=whatsapp`, `?ref=linkedin`); the console reports signups per source. Interview
10-15 respondents, especially those who chose a paid option.

**Channels:** founder stories (real email mistakes, own voice); communities (WhatsApp, LinkedIn, X);
honest search pages ("how to unsend an email in Gmail", "recall an email in Outlook"); built-in growth
("Sent with Clinton AI" on Safe Send pages, referral credits); partnerships (startup programmes,
co-working, agencies, recruiters).

## Metrics

The number that matters most early: **mistakes caught per active user.**

| Stage      | Metric                                     | Why                      |
| ---------- | ------------------------------------------ | ------------------------ |
| Validation | Signups by channel                         | Which channels work      |
| Validation | Survey completion rate                     | How much people care     |
| Validation | Share choosing a paid option (Q11, Q12)    | Willingness to pay       |
| Activation | Signups who connect Gmail/Outlook          | Onboarding works         |
| Activation | First email sent within 24 h               | First value              |
| Value      | "Fix it" accepted per user per week        | Mistakes actually caught |
| Value      | Smart Delay cancels; Safe Send withdrawals | Mistakes undone          |
| Retention  | WAU; week-4 retention                      | Habit                    |
| Outreach   | Reply and unsubscribe rate per campaign    | Quality, not spam        |
| Revenue    | Free-to-paid, MRR, churn                   | Business health          |
| Trust      | Safe Send landing in spam; complaints      | Deliverability and trust |

## Risks and mitigations

| Risk                                               | Mitigation                                                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Safe Send emails look like phishing / land in spam | Send from the sender's own address; clear card design; no recipient login; test across Gmail, Outlook, Yahoo before launch |
| Google verification delayed or refused             | Request only `gmail.send` first; prepare privacy policy and demo video early; submit during beta                           |
| Google or Microsoft copy the features              | Move faster; serve individuals and small teams; combine safety, writing, outreach; work across providers                   |
| "Withdrawing breaks trust/legal value"             | Withdraw-only, always-visible, opt-in; guidance not to use for contracts                                                   |
| Outreach used for spam                             | Daily limits, unsubscribe, do-not-contact, bought-list ban, complaint monitoring                                           |
| Breach of tokens or content                        | Encryption, short data life, security review before launch, least privilege                                                |
| AI check misses or false alarms                    | Rules + AI; measure accepted vs dismissed; tune                                                                            |
| People forget Safe Send                            | AI suggests it for risky emails                                                                                            |
| Name confusion / trademark                         | Trademark search; neutral branding; always "Clinton AI"                                                                    |
| Building everything at once                        | Phase strictly; ship v1 to the waitlist first                                                                              |
| Low willingness to pay                             | Validate with survey; lead with outreach and team plans if needed                                                          |

## Costs (approximate; check before buying)

Live v1 ≈ $50-80/month; v2 ≈ $100-150/month plus usage. Vercel Pro ~$20, Supabase Pro ~$25, AI per use
(fractions of a cent per check), domain, Sentry free tier. v2 adds background jobs (~$20-30), email
verification, website reading, payment fees. Later: CASA ~$540-720+/year, Apple $99/year, Google Play
$25 once, Chrome Web Store $5 once, SOC 2 (only with revenue).

## Team

Product lead (scope, roadmap, research, building with Claude Code); co-founder go-to-market; part-time
backend engineer (tokens, encryption, jobs, sending limits; before first real users and each phase);
product designer (v1, v2); mobile developer (mobile phase); support (after launch); security and
compliance adviser (verification, CASA, NDPA, SOC 2). **Every login, token and encryption change is
reviewed by a person.**
