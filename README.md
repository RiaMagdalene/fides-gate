# Fides Gate

Fides Gate is an AI crawler verification and accountability console for publishers. It verifies crawler identity before trusting declared intent, routes payloads by policy, embeds forensic canaries for permitted RAG responses, and records tamper-evident ledger events.

## Run locally

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/fides-gate run dev
```

The Replit workflows start the API and web console with the required preview routing automatically.

## Demo scenarios

Open the control room and run the four scenarios in order:

1. Verified Search — signed GPTBot receives a short snippet.
2. Verified RAG — signed ClaudeBot receives full content with a semantic canary.
3. Spoofed Crawler — an invalid signature falls back to the strictest tier.
4. Training Request — a valid training identity receives HTTP 402 licensing terms.

`POST /api/demo/reset` restores the seeded state for a repeat demo.

## API

The API is defined contract-first in `lib/api-spec/openapi.yaml`. The current demo service seeds an in-memory state on boot so the project works immediately without external infrastructure. The routes cover dashboard summaries, requests, crawlers, policies, analytics, simulations, canary scanning, and the public ledger.

## Docker

The included `docker-compose.yml` starts the API and frontend containers. The frontend is intended to be served behind the API path in a reverse proxy for production.