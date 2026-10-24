# AURA-Workforce

A privacy-first career-transition planner: four checkpoints from the market
evidence, through a person's profile, to the roles an AI concludes fit them, and a
study plan built around the hours they actually have.

---

## Team

| Field | Details |
|---|---|
| **Team name** | overinfinity |
| **Team Domain** | Domain 1 — The Aiversecity Future-Ready Workforce Domain |
| **SDG track (1-17)** | 4.4 (primary), 4.3, 8.5, 8.2 |
| **Team Leader** | Ahmad Adam Hakimi bin Naeman (IIUM) |
| **University** | International Islamic University Malaysia (IIUM) |
| **Team Members** | Amru Hazem bin Ahmad Tarmizi (IIUM), Muhammad Hadif Iddin bin Abdul Shukur (IIUM) |



## Links

| | |
|---|---|
| **GitHub Repository** | https://github.com/adamnaemman/sdc-hackathon |
| **Replit Project** | https://replit.com/@adamnaeman/AURA-Workforce |
| **Live demo** | https://aura-workforce.replit.app/ |
| **Pitch video** | _paste the YouTube link here_ |
| **PRD** | [`docs/SDC2026_overinfinity_Preliminary.pdf`](docs/SDC2026_overinfinity_Preliminary.pdf) |
| **Technical & Tools Declaration** | [`docs/SDC2026_overinfinity_TechDeclaration.pdf`](docs/SDC2026_overinfinity_TechDeclaration.pdf) |
| **Slide deck** | [`docs/PITCH DECK OVERINFINITY.pdf`](docs/AURA-Workforce-Deck.pdf), Canva link - https://canva.link/roz4g9e4dydd4gr |

## How to run the project

Requires **Node 20+** and **pnpm 9+**.

```bash
# 1. install
pnpm install

# 2. environment
cp .env.example .env        # then add your DeepSeek key: DEEPSEEK_API_KEY=sk-...

# 3. API on :8080
PORT=8080 pnpm --filter @workspace/api-server run dev

# 4. web on :5173 (second terminal)
pnpm --filter @workspace/aura-workforce run dev
```

| Variable | Required | Purpose |
|---|---|---|
| `DEEPSEEK_API_KEY` | for the AI features | every model call. Without it those features degrade to fallbacks instead of failing |
| `PORT` | no (default 8080) | API port |
| `BASE_PATH` | no (default `/`) | Vite base path |

Checks:

```bash
pnpm run build          # typecheck every package, then build api + web
node tests/smoke.mjs    # against localhost:8080, or API_URL=... node tests/smoke.mjs
```

## Project structure

```
artifacts/
  api-server/          Express API
    src/routes/        one file per endpoint group
    src/lib/           AI calls, trend maths, validation, logger
    src/data/          occupation library (916 occupations)
  aura-workforce/      React client (Vite)
    src/App.tsx        the four checkpoints and all client state
    src/components/    hero, avatar, checkpoint sections, chat, about, feedback
    src/lib/           i18n, settings, scoring, live trends, translations
lib/
  api-spec/            OpenAPI contract — both sides are generated from it
  api-zod/             Zod schemas shared by server and client
  api-client-react/    Orval-generated client (do not edit by hand)
  db/                  Drizzle config; unused at runtime, there is no database
docs/                  PRD, declaration, deck (PDF) + editable sources
submission/            the three PDFs the submission template asks for
tests/                 smoke test against a running API
scripts/               Python/Node tooling that generated the documents and assets
```

## How we used Replit & RunPod

**Replit** is where the product runs. The monorepo is a pnpm workspace; the API and
the web client are two Replit artifacts, and the deployment is an autoscaled Replit
app served at `aura-workforce.replit.app`. Replit **Secrets** hold
`DEEPSEEK_API_KEY`, so no credential is ever committed, and the Replit shell is how
we sync the workspace to GitHub (`git fetch && git reset --hard origin/adam`, see
`scripts/repl-sync.sh` — the Repl is a mirror, never the source of truth).

---

## What it does

One page, four checkpoints:

1. **Market signals** — 300 recent public postings, refreshed on demand. The most
   requested skills are plotted week by week, with the source, fetch time and sample
   size printed on the chart. Six sourced labour-market signals (BLS, WEF) sit below
   it, each with its own source note.
2. **Profile preferences** — role, industry, years of experience, available hours.
   One model call expands them into concrete, selectable skills. Tools are pre-ticked
   because they are factual; judgement skills stay unticked.
3. **Future roles** — the model proposes occupations from that profile, including
   ones outside our catalogue. Each comes with reasoning, skills to build, a first
   step, and an O\*NET-SOC or MASCO reference a reader can check. No salary or course
   is claimed that we could not source.
4. **Learning path** — the model may only choose courses from a library we verified
   link by link. Every step shows provider, hours and the reason for its order, and
   the plan is divided by the weekly hours the person entered. If nothing fits, it
   returns study topics with real search links instead of an invented course. Export
   to PDF with a QR code per step.

## The problem it answers

56% of Malaysian professionals already use AI at work, but only 26% have had formal
training (Hays Asia Salary Guide 2025), and MOSTI projects 600,000+ workers needing
reskilling within three to five years. What those workers lack is not information —
it is trustworthy direction. Career advice today is generic, static and rarely
sourced, and the training they are told to buy is expensive and often already out of
date.

## What the AI may not do

- **Closed vocabulary.** Every role and module identifier the model returns is
  validated against the catalogue server-side; unknown identifiers are discarded.
- **Visible disagreement.** The model's fit score sits next to a deterministic
  estimate, so the two can be compared rather than blended.
- **No storage.** No account, no database, no CV. The profile lives in the browser
  tab. The only thing the server writes is anonymous feedback, and that file is
  git-ignored.
- **Injection treated as data.** Free text is delimited, output is schema-validated,
  and the model never receives a tool that can write.

## Stack

React 19 · Vite · Tailwind CSS 4 · TanStack Query · Wouter · Express 5 · Zod ·
OpenAPI with Orval · TypeScript · pnpm workspaces · Replit hosting ·
DeepSeek `deepseek-chat` · O\*NET 30.1 · Arbeitnow job board API.

## Data and attribution

| Source | Use | Licence |
|---|---|---|
| O\*NET 30.1 (U.S. Department of Labor) | occupation library, role skills | CC BY 4.0 |
| Arbeitnow job board API | live postings for the trend layer | public endpoint, no key |
| U.S. Bureau of Labor Statistics, OOH | employment projections | public domain |
| WEF, Future of Jobs 2025 | skills-change context | quoted with attribution |

## Limitations

- The trend layer measures a **global** feed, not Malaysian vacancy counts. The
  interface says so; Phase 2 adds a local source.
- Skill matching is lexical, not semantic — the weakest part of the engine.
- Five curated roles cannot cover every occupation; checkpoint 03 makes that limit
  visible instead of hidden.
- Fit scores are directional, not predictions about a person.

## License

Apache-2.0 — see [`LICENSE`](LICENSE).
