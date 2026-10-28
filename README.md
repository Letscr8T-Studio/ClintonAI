# Clinton AI

**Never regret an email again.** Clinton AI is an AI email copilot that checks every email for
mistakes, holds it while you think, and lets you take it back for 24 hours, even after it's opened.
It grows into an assistant that writes, personalises and follows up for you.

This repo is the tryclinton.com web app: today the public landing page, waitlist and founders console
(Phase 0), and next the v1 safety platform (Phase 1).

> **New here (human or AI)? Read [CLAUDE.md](CLAUDE.md) first.** It explains the product, the current
> phase, the non-negotiable rules and how the code is organised.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase, Tally and admin values
npm run dev                  # http://localhost:3000
```

Full setup, env vars and deploy: [docs/engineering/environment.md](docs/engineering/environment.md).

## Scripts

| Command                           | What it does                                            |
| --------------------------------- | ------------------------------------------------------- |
| `npm run dev`                     | Dev server                                              |
| `npm run build` / `npm start`     | Production build / serve                                |
| `npm run check`                   | Typecheck + lint + format check + unit tests            |
| `npm test` / `npm run test:watch` | Vitest                                                  |
| `npm run test:e2e`                | Playwright (run `npx playwright install chromium` once) |
| `npm run format`                  | Prettier write                                          |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase · zod · Vitest ·
Testing Library · axe-core · Playwright · Vercel.

## Documentation

| Area        | Docs                                                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product     | [Vision](docs/product/vision.md) · [Features & flows](docs/product/features.md) · [Roadmap](docs/product/roadmap.md) · [Trust rules](docs/product/trust-rules.md) · [Brand](docs/product/brand.md) · [Business](docs/product/business.md)                    |
| Engineering | [Architecture](docs/engineering/architecture.md) · [Conventions](docs/engineering/conventions.md) · [Testing](docs/engineering/testing.md) · [Security & compliance](docs/engineering/security.md) · [Environment & deploy](docs/engineering/environment.md) |
| Phases      | [Phase 0: validation](docs/phases/phase-0-validation.md) · [Phase 1: safety platform](docs/phases/phase-1-safety-platform.md)                                                                                                                                |
| History     | [Decision log](docs/decisions.md)                                                                                                                                                                                                                            |
