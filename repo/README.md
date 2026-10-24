# AURA-Workforce

A privacy-first career-transition planner: four checkpoints from the market
evidence, through a person's profile, to the roles an AI concludes fit them, and
a study plan built around the hours they actually have.

Built for **SDC Hackathon 2026 — Domain 1, The Aiversecity Future-Ready Workforce
Domain** by team **overinfinity** (Ahmad Adam Hakimi bin Naeman, IIUM).

| | |
|---|---|
| Live prototype | https://aura-workforce.replit.app/ |
| Walkthrough video | see `submission/README.md` |
| Written submission | `docs/` |
| License | Apache-2.0 |

## The problem

56% of Malaysian professionals already use AI at work, but only 26% have had
formal training (Hays Asia Salary Guide 2025). MOSTI projects 600,000+ workers
will need reskilling within three to five years. The advice those workers receive
is generic, static and rarely cites a source — and the training they are told to
buy is expensive and often already out of date.

## What it does

One page, four checkpoints:

1. **Market signals** — 300 recent public job postings, refreshed on demand. The
   most requested skills are plotted week by week, with the source, fetch time and
   sample size printed on the chart. Six sourced labour-market signals (BLS, WEF)
   sit below it, each with its own source note.
2. **Profile preferences** — role, industry, years of experience and available
   hours. One model call expands them into concrete, selectable skills. Tools are
   pre-ticked because they are factual; judgement skills stay unticked.
3. **Future roles** — the model proposes occupations from that profile, including
   ones outside our catalogue. Each comes with reasoning, the skills to build, a
   first step, and an occupational reference (O\*NET-SOC or MASCO) a reader can
   check. Nothing here claims a salary or a course we could not source.
4. **Learning path** — the model may only choose courses from a library we
   verified link by link. Every step shows provider, hours and the reason it was
   ordered there, and the plan is divided by the weekly hours the person entered.
   If nothing fits, it returns study topics with real search links instead of an
   invented course. Export to PDF with a QR code per step.

## What the AI may not do

This is the part the product is built around.

- **Closed vocabulary.** Every role and module identifier the model returns is
  validated against the catalogue server-side; unknown identifiers are discarded.
- **Visible disagreement.** The model's fit score is shown next to a deterministic
  estimate, so the two can be compared rather than blended.
- **No storage.** No account, no database, no CV upload. The profile lives in the
  browser tab and is gone when it closes. The one thing the server writes is
  anonymous feedback (`data/feedback.jsonl`), and that file is git-ignored.
- **Injection treated as data.** Free text is delimited, output is schema
  validated, and the model never receives a tool that can write.

## Stack

React 19 · Vite · Tailwind CSS 4 · TanStack Query · Wouter · Express 5 · Zod ·
OpenAPI with Orval · TypeScript · pnpm workspaces · Replit hosting ·
DeepSeek (`deepseek-chat`) · O\*NET 30.1 · Arbeitnow job board API.

## Repository layout

```
src/
  artifacts/api-server/    Express API — routes, AI calls, trend maths, data
  artifacts/aura-workforce/ React client — four checkpoints, components, i18n
  lib/api-spec/            OpenAPI contract both sides are generated from
  lib/api-zod/             Zod schemas shared by server and client
  lib/api-client-react/    Orval-generated client (do not edit by hand)
  lib/db/                  Drizzle config — unused at runtime, there is no database
docs/                      PRD, technical declaration, deck (PDF)
submission/                the artefacts a judge opens first
tests/                     smoke test against a running API
```

## Run it

Requires Node 20+ and pnpm.

```bash
pnpm install

# API on :8080
DEEPSEEK_API_KEY=... pnpm --filter @workspace/api-server run dev

# web on :5173
pnpm --filter @workspace/aura-workforce run dev
```

Environment:

| Variable | Required | Purpose |
|---|---|---|
| `DEEPSEEK_API_KEY` | for AI features | every model call; without it those features fall back instead of failing |
| `PORT` | no (8080) | API port |
| `BASE_PATH` | no (`/`) | Vite base path |

Copy `.env.example` to `.env` and fill in the key. No secret is committed.

## Tests

```bash
node tests/smoke.mjs                                   # against localhost:8080
API_URL=https://aura-workforce.replit.app node tests/smoke.mjs
```

See `tests/README.md` for what is and is not covered, and why.

## Data and attribution

| Source | Use | Licence |
|---|---|---|
| O\*NET 30.1 (U.S. Department of Labor) | occupation library, role skills | CC BY 4.0 |
| Arbeitnow job board API | live postings for the trend layer | public endpoint, no key |
| U.S. Bureau of Labor Statistics, Occupational Outlook Handbook | employment projections | public domain |
| World Economic Forum, Future of Jobs 2025 | skills-change context | quoted with attribution |

## Limitations

- The trend layer measures a **global** feed, not Malaysian vacancy counts. The
  interface says so; Phase 2 adds a local source.
- Skill matching is lexical, not semantic. It is the weakest part of the engine.
- Five curated roles cannot cover every occupation. Checkpoint 03 exists to make
  that limit visible rather than hidden.
- Fit scores are directional. They are not predictions about a person.

## License

Apache-2.0 — see `LICENSE`.
