# Fides Gate

Fides Gate verifies AI crawler identity before allowing content access, routes payloads by intent, preserves forensic signals, and records accountability events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/fides-gate run dev` — run the Fides Gate web console
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/fides-gate/src/App.tsx` — routed landing page and control room UI
- `artifacts/fides-gate/src/index.css` — Fides Gate theme, glass surfaces, and motion primitives
- `artifacts/api-server/src/lib/fides-data.ts` — seeded demo state, simulation engine, hash-chain records, and canary scanner
- `artifacts/api-server/src/routes/fides.ts` — dashboard, simulation, policy, analytics, canary, and ledger endpoints
- `lib/api-spec/openapi.yaml` — source-of-truth API contract

## Architecture decisions

- Demo state is intentionally seeded in memory so the hackathon console boots without external setup; API boundaries are still contract-first.
- Invalid crawler identity always resolves to the strictest payload tier, regardless of the declared intent.
- The public ledger is presented as a readable hash chain, not as a blockchain or smart-contract system.
- The UI polls live API queries on short intervals so the demo behaves like a live stream without requiring a separate realtime broker.

## Product

- Public landing page with “verify first” positioning
- Publisher control room with trust score, live request activity, policy router, and one-click four-scenario demo
- Request stream, crawler registry, intent policies, analytics, canary detector, public ledger, architecture, and settings views
- API simulation routes for verified search, verified RAG, spoofed crawler, training licensing, demo reset, and canary scan

## User preferences

- Premium dark glass UI, rounded editorial cards, cyan/mint/indigo signal colors, Inter body typography, and Silkscreen display labels
- Motion and hover feedback should make verification states visible without hurting scanability

## Gotchas

- Regenerate API client and Zod code after every OpenAPI change.
- The shared API is mounted at `/api`; frontend requests use generated hooks and must not hardcode service ports.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
