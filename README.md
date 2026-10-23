# AURA-Workforce

**A privacy-first career-transition planner for the AI era.** A worker describes their job, skills and
available hours; AURA returns the roles that fit, the gap between today and tomorrow, and a sequenced
learning pathway where every claim carries a source and a date.

Live prototype: **https://aura-workforce.replit.app/**
Built for **SDC Hackathon 2026 — Domain 1: The Aiversecity Future-Ready Workforce Domain**

---

## The problem

Malaysia's training system cannot keep up with how fast AI changes jobs.

- **56%** of Malaysian professionals already use AI at work, but only **26%** have received formal training
  (Hays Asia Salary Guide 2025).
- The Ministry of Science, Technology and Innovation estimates **more than 600,000 workers** will need
  reskilling within three to five years.

The people affected are specific: a procurement assistant whose routine work is being automated, a fresh
graduate choosing a first role, an HR manager planning next year's training budget, a TVET counsellor
advising students from a printed list.

What they lack is not information — it is **trustworthy direction**. Career advice today is generic,
static and rarely sourced. A worker cannot see which roles are rising, cannot tell which of their
existing skills transfer, cannot judge whether a pathway fits the hours they actually have, and has no
way to check where a claim came from.

---

## What it does

| | Feature | How it works |
|---|---|---|
| 1 | **Skills profile intake** | A guided four-step form, plus free-text extraction: paste "I chase suppliers and raise POs in Excel" and DeepSeek returns a structured profile constrained to the app's skill vocabulary. |
| 2 | **Live AI-trend signal layer** | 300 recent public job postings are fetched from the Arbeitnow API, tokenised, and counted against each role's required skills. Every number carries its source, fetch time, window and sample size. |
| 3 | **Future-role matching** | A deterministic, inspectable score: skills overlap, transferable skills, sector match, experience, disruption exposure and live demand. The breakdown is visible, not hidden. |
| 4 | **Personalised reskilling pathway** | Ordered steps with prerequisites respected, hours estimated, free/low-cost providers linked, and a reason for each step's position. |
| 5 | **SDG mapping** | Every role and learning step is tagged to UN SDG targets (4.4, 4.3, 8.2, 8.5, 3.8, 9.5, 12.6, 13.3). |
| 6 | **Handling uncertainty** | Two scenarios — Moderate (4-year runway) and Aggressive (18-month runway) — change planning urgency instead of pretending to predict the future. |

---

## How the AI is used (and what it is not allowed to do)

Two endpoints, both server-side, both grounded:

```
POST /api/extract   free text ──► { role, years, skills[], competencies[] }
POST /api/plan      whole profile + catalogue ──► { recommended role, ranking, ordered pathway }
```

The rules the system enforces, not just asks for:

- **The model may only choose from the catalogue** (5 roles, 20 learning steps). Every `roleId` and
  `moduleId` it returns is validated server-side; anything unknown is discarded.
- **It cannot invent a course, provider, URL or statistic.** Course links come from the catalogue; the
  model never writes one.
- **Its fit score is shown next to the deterministic estimate** (`AI 72 · app estimate 58`), so a
  disagreement is visible instead of hidden.
- **Prompt injection is treated as data.** The user's text is delimited and the output is schema-validated;
  an instruction inside a profile can at most pick a few allowed skills.

Model: `deepseek-chat`. Declared in the Technical & Tools Declaration, as required.

---

## Architecture

```
Browser (React SPA)
   │  same origin, no CORS, no tokens in localStorage
   ▼
/api  (Express 5)
   ├── /workforce/roles      curated catalogue: 5 roles + 20 learning steps
   ├── /workforce/signals    6 sourced market signals (BLS, WEF) with geography + period
   ├── /trends               live job postings → demand share, stamped source + date
   ├── /extract              free text → structured profile        (DeepSeek)
   └── /plan                 profile + catalogue → grounded plan   (DeepSeek)
```

Deployed on Replit as a web service (`/`) and an API service (`/api`). Secrets live in Replit Secrets —
never in the repository.

---

## Tech stack

React 19 · Vite 7 · Tailwind CSS 4 · Radix UI · TanStack Query · Wouter · Express 5 · Zod ·
OpenAPI 3.1 with Orval codegen · TypeScript 5.9 · pnpm workspaces · Node 24 · Replit (hosting) ·
DeepSeek (language model) · Arbeitnow (public job data).

---

## Running it

The project targets Replit (Linux). Quick start inside the Replit Shell:

```bash
pnpm install
PORT=8080 pnpm --filter @workspace/api-server run dev        # API on :8080
PORT=20531 BASE_PATH=/ pnpm --filter @workspace/aura-workforce run dev   # web on :20531
```

Check the API:

```bash
curl -s localhost:8080/api/healthz
curl -s localhost:8080/api/trends | head -c 200
node scripts/test-plan.mjs        # full AI plan round-trip
```

Required secrets: `DEEPSEEK_API_KEY`. Without it, `/api/extract` and `/api/plan` return `503` and the
rest of the app keeps working — the deterministic results never depend on the model.

> **Windows note:** the workspace intentionally installs only Linux binaries
> (`pnpm-workspace.yaml` overrides), so `pnpm install` on Windows will fail. Use Replit or WSL.

---

## Data, privacy and honesty

- **No accounts, no database, no CV upload.** A profile lives in browser memory and disappears when the
  tab closes.
- **Two things leave the browser, only on a button press:** a free-text description (forwarded to
  DeepSeek, not logged, not stored) and the structured profile summary sent with the plan request.
  Neither contains a name or contact detail.
- **All demo profiles are synthetic**, as the domain rules require.
- **Every market figure is a dated snapshot**, never described as live or Malaysia-specific unless it is.
  The trend layer measures the *direction* of skill demand in a global, tech-oriented board — the UI says
  so, and shows the sample size.

---

## Known limitations

1. **Five roles cannot serve every occupation.** The catalogue is a curated sample; when no role is a
   strong match the plan should say so rather than force a recommendation.
2. **The live feed is not Malaysian.** It signals direction, not local vacancy counts. Adding a Malaysian
   source is the first Phase 2 item.
3. **Skill matching is lexical**, not semantic: a hand-written alias table plus substring matching. It can
   produce false positives; embeddings are the planned fix.
4. **The sample is one page of postings** (300) refreshed at most every six hours.
5. **Single AI provider.** The client is OpenAI-compatible, so a fallback endpoint is a configuration
   change.

---

## Phase 2

A Malaysian trend source (DOSM / JobStreet-class postings) · semantic skill matching with embeddings ·
a counsellor view with cohort-level gaps · saved plans with explicit consent and one-click deletion ·
multi-language (English / Bahasa Malaysia / Chinese) · self-hosted model on RunPod GPU.

---

## Team — overinfinity

Ahmad Adam Hakimi bin Naeman · International Islamic University Malaysia (IIUM)

**Declaration:** the interface shell, the original three-role catalogue and the OpenAPI scaffolding
pre-date the hacking period and are declared in the submission's PRD (§6.1). Everything AI-related, the
live trend layer, the two additional roles and this documentation were built during Phase 1
(19–25 October 2026).
