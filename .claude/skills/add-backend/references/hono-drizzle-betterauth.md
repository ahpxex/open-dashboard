# Preset: Hono + Drizzle + better-auth (standalone TS service)

A standalone Bun/Hono service: the `products` resource as a **json-server-dialect REST
API** + **real better-auth** at `/api/auth/*` (CONTRACT §2b). The frontend reaches it via
`restRepository` (data) and the shipped `remoteBetterAuthProvider` (auth) — no UI changes.

## Add it

1. **Stand up the service** (copy the template out, or use it as the backend repo):
   ```bash
   cp -R .claude/skills/add-backend/templates/hono-drizzle-betterauth <dest> && cd <dest>
   bun install && bun run dev          # http://localhost:8787, zero-config bun:sqlite
   ```
   Seeds `dev@example.com` / `password` + a few products on first boot. Set `DATABASE_URL`
   for Postgres; `FRONTEND_ORIGIN` (default `http://localhost:3000`) for CORS/trustedOrigins.
2. **Data** — in `src/features/products/server.ts`, replace the `drizzleRepository` binding
   with `restRepository({ baseUrl: process.env.PRODUCTS_API_URL!, path: "/products", map: (r) => r })`.
   Defaults already match this service's dialect (`_page/_limit/_sort/_order/q` +
   `x-total-count`); the `status` filter passes through. Server fns/queries/table unchanged.
3. **Auth** — activate the shipped provider:
   ```ts
   // src/lib/auth-provider.ts
   import { remoteBetterAuthProvider } from "@/lib/auth-providers/remote-better-auth";
   export const authProvider: AuthProvider = remoteBetterAuthProvider;
   ```
   Set `AUTH_SERVER_URL=http://localhost:8787`. **Keep `src/lib/auth-client.ts` as-is**
   (proxy mode — the browser hits same-origin `/api/auth/*`; the provider proxies).
4. Frontend env: `PRODUCTS_API_URL` + `AUTH_SERVER_URL` (this service's origin).

## Foundation it assumes

`restRepository` (`@/infra/data`), the `AuthProvider` seam, and
`src/lib/auth-providers/remote-better-auth.ts` (ships in the base, typechecked). Bun
runtime for the service. CONTRACT.md §1 (data) + §2b (auth).

## Invariants

- The service speaks the json-server dialect verbatim + sets `X-Total-Count`; sort/search/
  filter honor the whitelists (never raw input).
- Auth is the same better-auth protocol as the in-process default — the frontend wiring is
  a thin **remote proxy**, not a re-implementation; `Set-Cookie` is rewritten host-only.
- Secrets/keys stay server-side; `BETTER_AUTH_SECRET` fails closed in production.

## Verify

- **The service**: `cd <dest> && bun install && bun run typecheck && bun test` (15-test
  contract suite over in-memory SQLite). Boot + smoke: `GET /products` returns
  `X-Total-Count`; `POST /api/auth/sign-in/email` logs in the seeded account.
- **End-to-end**: run the service + `bun run dev` in the dashboard with the env above; an
  unauthenticated `/` redirects to `/login`, sign-in works, `/products` lists service data.
