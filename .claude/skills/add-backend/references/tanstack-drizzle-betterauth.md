# Preset: TanStack Start + Drizzle + better-auth (the in-process default)

The default backend — and it **is** the scaffold itself. Data and auth run in-process
inside TanStack Start server functions; there is no separate service. Pick this when you
want the scaffold's own backend (Postgres in prod, in-memory zero-config in dev).

## Add it

Nothing to copy — it's already wired. To grow it:

- **A resource**: `bun run create-resource <name>` (scaffolds `src/features/<name>/*` +
  the route + a Drizzle table + a sidebar entry), then customise the fields. Or copy
  `src/features/products/`. See SKILL.md §1.
- **Postgres**: `cp .env.example .env` (set `DATABASE_URL` + `BETTER_AUTH_SECRET`),
  `bun run db:up && bun run db:generate && bun run db:migrate`. Without `DATABASE_URL` the
  app runs zero-config on in-memory data + auth.

`templates/tanstack-drizzle-betterauth/` is a pointer (README + `.env.example`); the real
code is `src/features/products`, `src/db/schema.ts`, `src/lib/auth.ts`.

## Foundation it assumes

The scaffold base: the `Repository` seam (`drizzleRepository` / `memoryRepository`), the
`AuthProvider` seam (`betterAuthProvider`), `hasDatabase` (`@/lib/backend`), and the
`createServerFn` boundary. No external service.

## Invariants

- `betterAuthProvider` + the better-auth React client stay the active bindings.
- Each resource binds `drizzleRepository` behind `hasDatabase` with a `memoryRepository`
  fallback (server-only). Standard resource invariants (SKILL.md §1) apply.
- `BETTER_AUTH_SECRET` fails closed in production.

## Verify

Covered by the repo's own suite — `bun run typecheck && bun run check && bun run test &&
bun run build`. The login flow + the `products` resource are the live proof.
