# Testing

## Layers

| Layer          | Tool                                   | Where                                                                                           | What it covers                                                                               |
| -------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Unit           | Vitest                                 | `src/**/*.test.ts` beside the code                                                              | Pure logic: validation, time, analytics, CSV, sessions, rate limiting, content integrity     |
| Route handlers | Vitest (`// @vitest-environment node`) | `src/app/api/**/route.test.ts`                                                                  | Status codes and bodies; repository mocked with `vi.mock`                                    |
| Components     | Vitest + Testing Library + user-event  | `src/components/**/*.test.tsx`                                                                  | Behaviour through roles and labels, the way users and screen readers see it                  |
| Accessibility  | axe-core                               | `src/app/page.test.tsx` (jsdom), `e2e/landing.spec.ts` (real browser, includes colour contrast) | Zero violations on the landing page                                                          |
| End-to-end     | Playwright (desktop Chrome + Pixel 7)  | `e2e/`                                                                                          | Page loads, waitlist flow (API mocked), mobile menu, security headers, console auth redirect |

## Commands

```bash
npm test               # all unit/component tests once
npm run test:watch     # watch mode
npm run test:coverage  # coverage report in coverage/
npm run test:e2e       # builds, starts on :3100, runs Playwright
npx playwright install chromium   # first time only
```

## Rules

- Every new pure function gets a unit test. Every new route gets a route test (happy path, invalid input, failure path).
- Query by role, label or text (`getByRole("button", { name: … })`), never by class name or test id unless there is no accessible handle.
- Mock at the repository boundary (`@/server/<domain>/repository`), not Supabase internals.
- Use `src/test/fixtures.ts` builders (`makeSignup`, `jsonRequest`) instead of hand-rolled objects.
- Time-dependent logic takes a `now` parameter so tests pass a fixed instant.
- Env-dependent logic: `vi.stubEnv` (auto-reset between tests by config).
- `server-only` is aliased to a stub in `vitest.config.mts`, so server modules import cleanly in tests.
- A content change that breaks `src/content/content.test.ts` is a real problem (broken anchor, duplicate, banned claim), not a test to delete.

## CI

`.github/workflows/ci.yml` runs on every push and PR: typecheck, lint, format check, unit tests, build,
then Playwright. A red CI blocks merge.
