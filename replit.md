# AURA-Workforce

A privacy-first career-transition planner that helps workers and counselors compare future-ready roles, understand transferable skills and gaps, and explore sourced upskilling pathways.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/aura-workforce run typecheck` — typecheck the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

The AURA app and workforce reference endpoints do not require a database or user credentials.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aura-workforce/` — React/Vite app
- `artifacts/api-server/src/routes/workforce.ts` — curated role, learning-path, and labor-signal catalog
- `lib/api-spec/openapi.yaml` — source of truth for API contracts

## Architecture decisions

- Profiles are held only in browser memory; do not persist, upload, or send profile or CV data to the API.
- Role-fit scoring and disruption scenarios run in the browser; the API only serves non-personal reference data.
- Labor-market indicators are sourced snapshots, not live feeds; show each source, geography, period, and caveat.
- Forecasts are directional estimates, not guarantees or individualized employment predictions.

## Product

The app supports guided profile intake, transferable-skill matching, moderate/aggressive disruption scenarios, modular learning plans, SDG tags, and source-linked labor-market signals.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- When changing the API contract, regenerate the client and Zod schemas before using new types.
- Do not describe the curated BLS/WEF snapshot as real-time or Malaysia-specific labor-market data.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
