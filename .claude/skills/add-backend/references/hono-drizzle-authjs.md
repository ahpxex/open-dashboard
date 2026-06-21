# Preset: Hono + Drizzle + Auth.js / NextAuth (standalone TS service)

A standalone Bun/Hono service: the `products` resource as a **json-server-dialect REST
API** + **Auth.js (NextAuth) v5** with a Credentials provider at `/api/auth/*` (CONTRACT
§2c). The frontend reaches it via `restRepository` (data) and the shipped
`remoteAuthjsProvider` + `authjs` client (auth). Pick this when the project standardizes
on Auth.js.

## Add it

1. **Stand up the service**:
   ```bash
   cp -R .claude/skills/add-backend/templates/hono-drizzle-authjs <dest> && cd <dest>
   bun install && bun run dev          # http://localhost:8789, zero-config bun:sqlite
   ```
   Seeds `dev@example.com` / `password` + sample products. Auth.js mounts via
   `@hono/auth-js` with `basePath: "/api/auth"`, Credentials provider (JWT sessions,
   required by Credentials), plus a custom `POST /api/auth/register` (Auth.js has no
   sign-up). `AUTH_SECRET` fails closed in production; `DATABASE_URL` switches to Postgres.
2. **Data** — bind `restRepository({ baseUrl: process.env.PRODUCTS_API_URL!, path: "/products", map: (r) => r })`
   in `src/features/products/server.ts` (defaults match the dialect).
3. **Auth** — activate the shipped provider + matching client:
   ```ts
   // src/lib/auth-provider.ts
   import { remoteAuthjsProvider } from "@/lib/auth-providers/remote-authjs";
   export const authProvider: AuthProvider = remoteAuthjsProvider;
   // src/lib/auth-client.ts
   export * from "@/lib/auth-clients/authjs";
   ```
   Set `AUTH_SERVER_URL=http://localhost:8789`. Proxy mode: the browser hits same-origin
   `/api/auth/*`; the provider proxies + rewrites `Set-Cookie` host-only (so both
   `authjs.csrf-token` and `authjs.session-token` land on the dashboard). The client drives
   Auth.js's CSRF → credentials-callback dance, then confirms via the `getSession` server fn.
4. Frontend env: `PRODUCTS_API_URL` + `AUTH_SERVER_URL`. The service needs
   `FRONTEND_ORIGIN=http://localhost:3000` for CORS.

## Foundation it assumes

`restRepository` + `src/lib/auth-providers/remote-authjs.ts` +
`src/lib/auth-clients/authjs.ts` (ship in the base, typechecked + unit-tested). CONTRACT
§1 + §2c. `@hono/auth-js` + `@auth/core`. Auth.js Credentials ⇒ JWT session strategy.

## Invariants

- json-server dialect verbatim + `X-Total-Count`; whitelists honored.
- Credentials use a JWT session (Auth.js requirement); the `jwt`/`session` callbacks put a
  stable user `id` on the token so `/api/auth/session` returns `{ user: { id, name, email } }`.
  Passwords bcrypt-hashed. `/api/auth/session` returns `null` when anonymous (the provider
  handles both shapes). `AUTH_SECRET` fails closed in production.

## Verify

- **The service**: `bun install && bun run typecheck && bun test` — 18-test suite driving
  the REAL Auth.js CSRF + cookie flow (csrf → register → callback/credentials → session) +
  products CRUD/search/filter/sort/pagination. Boot + smoke (port 8789): `GET /api/auth/csrf`
  issues the token, `POST /api/auth/callback/credentials` sets the session cookie (302),
  `GET /api/auth/session` returns the user; wrong password ⇒ session stays `null`.
- **End-to-end**: run the service + the dashboard with the env above; sign-up/sign-in then
  `/products` lists the service's data.
