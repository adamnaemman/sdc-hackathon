# AURA-Workforce — consolidated source

A single, flat copy of every source file in the project, made so the code can be
read, reviewed or rebuilt without navigating a pnpm monorepo.

| | |
|---|---|
| Files | 144 |
| Lines | 15,124 |
| Built by | `python scripts/consolidate_source.py` |
| Manifests | `MANIFEST.txt` (file list) · `ALL_CODE.md` (everything concatenated) |

> This folder is a **copy**. The running application is unchanged; nothing here is
> imported by the deployed build. It exists for reconstruction and hand-in.

## Layout

```
submission/
├── README.md                  this file
├── MANIFEST.txt               every file, with its line count
├── ALL_CODE.md                every file concatenated, for reading offline
├── src/
│   ├── api/                   Express server  (was artifacts/api-server/src)
│   │   ├── index.ts           entry point — reads PORT, starts the server
│   │   ├── app.ts             middleware, JSON limits, trust proxy
│   │   ├── routes/            one file per endpoint group
│   │   ├── lib/               AI calls, trend maths, validation, logger
│   │   └── data/              occupation library (916 occupations)
│   ├── web/                   React client   (was artifacts/aura-workforce/src)
│   │   ├── main.tsx           entry point — mounts App
│   │   ├── App.tsx            shell, four checkpoints, state, API calls
│   │   ├── components/        hero, avatar, checkpoint sections, chat, about…
│   │   ├── lib/               i18n, settings, scoring, live trends, translations
│   │   ├── pages/             not-found
│   │   └── index.css          tokens, dark mode variables, print rules
│   └── shared/
│       ├── api-zod/           Zod schemas shared by server and client
│       ├── api-client-react/  Orval-generated client (do not edit by hand)
│       └── db/                Drizzle config (unused at runtime: no database)
└── config/
    ├── package.json           workspace root
    ├── pnpm-workspace.yaml
    ├── tsconfig.base.json     path aliases for @workspace/*
    ├── openapi.yaml           the contract both sides are generated from
    ├── api-server/            package.json, tsconfig, artifact.toml
    ├── aura-workforce/        package.json, tsconfig, vite.config, index.html
    └── lib/                   package manifests for the three shared packages
```

## Entry points

| Where | File | What it does |
|---|---|---|
| Server | `src/api/index.ts` | reads `PORT` (default 8080), mounts the router, listens |
| Router | `src/api/routes/index.ts` | health, workforce, trends, extract, plan, explore, library, pathway, help, greet, feedback |
| Client | `src/web/main.tsx` | mounts `<App/>` into `#root` |
| App | `src/web/App.tsx` | the shell, the four checkpoints, all client state |
| Contract | `config/openapi.yaml` | source of truth for `shared/api-zod` and `shared/api-client-react` |

## Environment

| Variable | Required | Used by |
|---|---|---|
| `DEEPSEEK_API_KEY` | yes, for AI features | `lib/buildPlan.ts`, `lib/exploreRoles.ts`, `lib/extractProfile.ts`, `lib/buildPathway.ts`, `lib/helpAssistant.ts`, `lib/greeting.ts` |
| `PORT` | no (defaults to 8080) | `src/api/index.ts` |
| `BASE_PATH` | no (defaults to `/`) | Vite config |

No secret is committed anywhere in this tree.

## Running the original project

This flat copy is for reading. To actually run it, use the repository as-is:

```bash
pnpm install
pnpm --filter @workspace/api-server run dev     # API on :8080
pnpm --filter @workspace/aura-workforce run dev # web on :5173
```

The imports use workspace names (`@workspace/api-zod`, `@workspace/api-client-react`),
so the packages must sit at their original paths for pnpm to resolve them — which is
why the config files below keep their per-package grouping instead of being flattened.

## Mapping back to the repository

| Consolidated | Original |
|---|---|
| `src/api/` | `artifacts/api-server/src/` |
| `src/web/` | `artifacts/aura-workforce/src/` |
| `src/shared/api-zod/` | `lib/api-zod/src/` |
| `src/shared/api-client-react/` | `lib/api-client-react/src/` |
| `src/shared/db/` | `lib/db/src/` |
| `config/api-server/` | `artifacts/api-server/` |
| `config/aura-workforce/` | `artifacts/aura-workforce/` |
| `config/lib/*` | `lib/*/` |

## What is deliberately not here

| Excluded | Why |
|---|---|
| `node_modules/`, `dist/`, `.git/` | build output, not source |
| `artifacts/mockup-sandbox/` | a Replit scaffold that is not part of the product |
| `docs/`, `scripts/` | submission documents and the build scripts that produce them |
| `attached_assets/` | reference images |

## Reading order, if you are reviewing this

1. `src/api/routes/index.ts` — what the server exposes.
2. `src/api/lib/buildPlan.ts` and `buildPathway.ts` — where the model is constrained.
3. `src/web/App.tsx` — the four checkpoints and how state flows.
4. `src/web/components/` — one file per section.
5. `config/openapi.yaml` — the shape both sides agree on.
