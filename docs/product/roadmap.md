# Roadmap

Nine phases, safety first. **Each phase opens only when its gate is met**, so we never build ahead of
demand. Phases 2 and 3 may swap depending on what the survey's Q10 answers show users want next.

Update the **Status** column whenever a phase starts or ships, and keep the public, simplified
version in `src/content/roadmap.ts` consistent with it.

| #   | Phase                       | Scope                                                                          | Gate to open the _next_ phase                  | Status                                                        |
| --- | --------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------- |
| 0   | Validation                  | Waitlist, Tally survey, interviews, founders console                           | Waived by founder decision (2026-10-28)        | **Live**                                                      |
| 1   | v1 safety platform (launch) | Connect Gmail; AI check, Smart Delay, Safe Send; user dashboard; 100-user beta | Google verification approved; beta used weekly | **In progress**, [plan](../phases/phase-1-safety-platform.md) |
| 2   | v2 Outreach                 | Lead import, personalisation, review queue, follow-ups, payments               | First paying users                             | Planned                                                       |
| 3   | Chrome extension            | Safety and the AI assistant inside Gmail                                       | Chrome Web Store approval                      | Planned                                                       |
| 4   | More providers              | Outlook / Microsoft 365, then Yahoo and custom domains                         | CASA security assessment passed                | Planned                                                       |
| 5   | Full inbox AI               | Reply detection, summaries, priorities, reminders                              | Users keep coming back on web                  | Planned                                                       |
| 6   | Mobile apps                 | iOS and Android with the full safety layer                                     | Demand from builders running agents            | Planned                                                       |
| 7   | AI agent guardrails         | API for bots: checks, review holds, rules, logs                                | Teams asking for admin controls                | Planned                                                       |
| 8   | Teams and enterprise        | Shared templates, admin rules, SSO, SOC 2                                      | n/a                                            | Planned                                                       |

## Launch steps

1. Private beta with up to 100 testers (Google's pre-verification limit), chosen from survey respondents. **The 100-user count cannot be reset; invite carefully.**
2. Submit for Google verification while the beta runs.
3. Public launch worldwide, priced in US dollars (Product Hunt, X, LinkedIn, Reddit, Hacker News).
4. Bigger Product Hunt / global push once the extension and Outlook support are ready.

## Phase plan documents

Write a `docs/phases/phase-N-*.md` before starting each phase: scope, data model, routes, jobs,
milestones, acceptance criteria, open questions. Mark the phase **Live** here when it ships.
