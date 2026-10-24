# Submission pack — overinfinity / AURA-Workforce

Everything below is ready except the video. Submit at **sdchack.my** before **25 Oct 2026, 07:59 MYT**.

## Deliverables

| # | Item | File / link | Status |
|---|---|---|---|
| 1 | Product Requirement Document (official template) | `docs/SDC2026_overinfinity_Preliminary.pdf` | ✅ 973 KB |
| 2 | Technical & Tools Declaration | `docs/SDC2026_overinfinity_TechDeclaration.pdf` | ✅ 1,094 KB |
| 3 | Pitch deck | `docs/AURA-Workforce-Deck.pdf` (12 slides, 16:9) | ✅ rebuilt |
| 4 | Live prototype | https://aura-workforce.replit.app/ | ✅ deployed |
| 5 | GitHub repository | https://github.com/adamnaemman/sdc-hackathon | ✅ |
| 6 | Pitching video (5–7 min, YouTube) | link in the form | ✅ recorded |

> Video over 7:00 costs **1 point per 30 seconds**. Aim for 6:30.

## Form answers (draft)

**Project name:** AURA-Workforce
**Domain:** Domain 1 — The Aiversecity Future-Ready Workforce Domain
**SDG track:** 4.4 (primary), 4.3, 8.5, 8.2
**Team:** overinfinity — Ahmad Adam Hakimi bin Naeman, IIUM

**Short description (≈120 words):**

> AURA-Workforce is a privacy-first career-transition planner. A worker enters their role, industry,
> experience and available hours; the app shows evidenced market signals, expands their profile into
> concrete skills, and asks an AI planner — grounded in a curated catalogue — which future roles fit them
> and in what order to learn. Every market figure carries a source URL, a fetch date and a sample size;
> every course link was verified before shipping. The model may choose and explain, but it cannot invent
> a job, a course or a statistic: all IDs are validated server-side and unknown ones are discarded.
> Profiles live in browser memory only — no accounts, no database, no CVs. Built on Replit with DeepSeek,
> O*NET and Arbeitnow data.

**Tech used:** React 19, Vite, Tailwind CSS 4, Radix UI, TanStack Query, Express 5, Zod, OpenAPI + Orval,
TypeScript, pnpm workspaces, Replit (hosting + deploy), DeepSeek `deepseek-chat`, O*NET 30.1 (CC BY 4.0),
Arbeitnow Job Board API.

**AI tools declared:** DeepSeek (chat + coding agent, major use) · Replit Agent (minor).

## YouTube upload

**Title:** `AURA-Workforce — from who you are today, to what you learn next (SDC 2026, Domain 1)`

**Visibility:** Unlisted (pitching video link is submitted, not published)

**Description:**

```
AURA-Workforce is a privacy-first career-transition planner built for SDC Hackathon 2026, Domain 1
(The Aiversecity Future-Ready Workforce Domain) by team overinfinity, IIUM.

Live prototype: https://aura-workforce.replit.app/
Code: https://github.com/adamnaemman/sdc-hackathon

Chapters
0:00 Problem and who it is for
0:25 Checkpoint 01 — market signals, sourced and dated
1:05 The live trend layer (300 postings, refreshed on demand)
1:35 Checkpoint 02 — profile intake, AI suggests skills
2:45 Checkpoint 03 — the roles the AI concludes fit you
4:05 Checkpoint 04 — verified learning pathway
5:05 Time budget: 29 hours, 5 weeks at 6 h/week
5:35 SDG mapping, privacy, and limits
6:10 Stack and links

Built with React, Express, DeepSeek, O*NET and Arbeitnow data. No personal data is stored.
```

## Before you press submit

- [ ] Open the live URL in a **private window** — hero loads, four checkpoints scroll
- [ ] Profile → Apply → three AI role cards appear (needs `DEEPSEEK_API_KEY` in Replit Secrets)
- [ ] One card → Build verified pathway → steps with provider links (or topic plan)
- [ ] Repo is public or judges added as collaborator
- [ ] No secrets in the repo (`git log -p | grep -i "sk-\|api_key"` returns nothing)
- [ ] Video is ≤ 7:00 and the YouTube link opens without login
- [ ] All three PDFs uploaded, filenames unchanged
- [ ] **No commits after the deadline** — repository freeze applies

---

## Verified state (25 Oct, 03:35 MYT)

| Check | Result |
|---|---|
| `pnpm install` | clean, 9 workspace projects |
| `pnpm run build` | typecheck green for api-server, aura-workforce, scripts; vite build 451 kB |
| `node tests/smoke.mjs` | `all checks passed` (health, roles, signals, trends, library) |
| Live API | https://aura-workforce.replit.app/api/healthz → 200 |

## Form answers, ready to paste

**Project name** — AURA-Workforce
**Domain** — Domain 1, The Aiversecity Future-Ready Workforce Domain
**SDG track** — 4.4 (primary), 4.3, 8.5, 8.2
**Team** — overinfinity (Ahmad Adam Hakimi bin Naeman, IIUM)
**Live prototype** — https://aura-workforce.replit.app/
**Repository** — https://github.com/adamnaemman/sdc-hackathon
**Video** — _(paste the YouTube link)_ ✅ recorded
**PRD** — `SDC2026_overinfinity_Preliminary.pdf`
**Technical & Tools Declaration** — `SDC2026_overinfinity_TechDeclaration.pdf`
**Deck** — `AURA-Workforce-Deck.pdf` (12 slides)

Short description: see the block above ("AURA-Workforce is a privacy-first
career-transition planner…"). It is 120 words.
