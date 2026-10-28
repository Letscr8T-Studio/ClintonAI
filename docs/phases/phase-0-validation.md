# Phase 0: Validation

**Status:** Live. **Gate to Phase 1:** the survey shows people will pay (share choosing a paid option in Q11/Q12).

## Built

- Landing page (`src/app/page.tsx`): hero, inbox support, "you know the feeling", seven-pillar platform grid, product shot, how it works, dashboard preview, outreach preview, comparison with Undo Send, roadmap, FAQ, waitlist.
- Waitlist API (`/api/waitlist`) with validation, honeypot, rate limit, duplicate-safe upsert and source attribution (`?ref=` / `?utm_source=` / referrer).
- Tally priority-access survey popup with hidden email; `/api/survey-complete` marks `did_survey`.
- Founders console (`/owner`): overview KPIs, signups chart (7/30/90 d), survey funnel, sources, latest signups, searchable/filterable signups table, CSV export, analytics by source/weekday/hour.
- SEO: metadata, Open Graph image, JSON-LD (Organization, SoftwareApplication, FAQPage), sitemap, robots, manifest.
- Quality: strict TS, ESLint (a11y), Prettier, Vitest + axe, Playwright, CI.

## Remaining Phase 0 tasks

- [ ] Survey fixes in Tally: remove email question, fix Q9 duplicate option, Q14 conditional logic, add "which email provider" and "AI agents sending email" questions.
- [ ] Replace client-reported survey completion with a signed Tally webhook (`/api/webhooks/tally`).
- [ ] Interview 10-15 respondents, prioritising paid-option choosers; log insights in `docs/research/` (create when first interview happens).
- [ ] Trademark search on "Clinton AI" for software.
- [ ] Secure social handles (@tryclinton / @clintonai).
- [ ] Decide Phase 2 vs Phase 3 order from survey Q10.
- [ ] Gate review: write the result (paid-option share, segments) in [decisions.md](../decisions.md) and mark Phase 1 started in [roadmap.md](../product/roadmap.md).
