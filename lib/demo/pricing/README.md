# Blast Radius demo module

A small, self-contained module used to demonstrate DevDigest's **Blast
Radius** on a pull request. It is not wired into the app.

- `pricing.ts` — the code a demo PR changes (two functions).
- `*.routes.ts` — HTTP routes that call it (`router.get('/path', …)`).
- `*.job.ts` — scheduled jobs that call it (`cron.schedule('…', …)`).
- `runtime.ts` — a tiny in-memory router and scheduler so the module
  compiles without extra dependencies.

DevDigest indexes `main`, so the routes and jobs live here; a PR that edits
only `pricing.ts` then shows 2 symbols → 5 callers → 4 endpoints → 2 crons.
