# Preset: Hono + Prisma + better-auth (standalone TS service)

The **Prisma sibling** of `hono-drizzle-betterauth`: same wire contract (json-server REST
products + real better-auth at `/api/auth/*`, CONTRACT §2b) and **identical frontend
wiring** — only the ORM differs (Prisma Client instead of Drizzle). Pick this when the
project standardizes on Prisma.

## Add it

1. **Stand up the service**:
   ```bash
   cp -R .claude/skills/add-backend/templates/hono-prisma-betterauth <dest> && cd <dest>
   bun install && bun run dev          # http://localhost:8788, zero-config Prisma SQLite
   ```
   `bun install` runs `prisma generate` (postinstall); `bun run dev`/`start` run
   `prisma db push` first (predev/prestart) — no manual migrate step. Seeds
   `dev@example.com` / `password` + sample products. Set `DATABASE_URL` for Postgres (it
   swaps in `prisma/schema.postgres.prisma`); `FRONTEND_ORIGIN` for CORS/trustedOrigins.
2. **Data + Auth** — wire **exactly as `hono-drizzle-betterauth`** (`PRODUCTS_API_URL` +
   the shipped `remoteBetterAuthProvider`, proxy mode, keep `auth-client`). Only the port
   differs (8788). See `references/hono-drizzle-betterauth.md` steps 2–4.

## Foundation it assumes

`restRepository` + `src/lib/auth-providers/remote-better-auth.ts` (ships in the base).
CONTRACT §1 + §2b. Bun runtime, Prisma 6.x (`prismaAdapter` from
`better-auth/adapters/prisma`). The two `prisma/schema*.prisma` files (SQLite + Postgres)
must stay in lockstep — a Prisma datasource provider can't be env-driven in one schema.

## Invariants

- json-server dialect verbatim + `X-Total-Count`; whitelists honored; zod `.strict()`.
- Auth is real better-auth (Prisma adapter) — frontend wiring is the remote-better-auth
  proxy, host-only `Set-Cookie`. `BETTER_AUTH_SECRET` fails closed in production.

## Verify

- **The service**: `bun install && bun run typecheck && bun run test` — use `bun run test`
  (**not** `bun test`: `bun run test` fires the `pretest` hook that runs `prisma db push`
  to create the schema; a bare `bun test` skips it and the tables won't exist). 15-test
  contract suite. Boot + smoke: seeded sign-in + `/products` with `X-Total-Count`.
- **End-to-end**: identical to the Drizzle preset.
