# Auth preset wiring (dormant, verified)

Ready-to-activate `AuthProvider` implementations for the non-default backend presets in
the [`add-backend`](../../../.claude/skills/add-backend) skill. They are **dormant** —
the active binding in [`../auth-provider.ts`](../auth-provider.ts) stays `betterAuthProvider`
— but they live in `src/` so the repo typechecks them (no drift, unlike inline snippets).
They depend on nothing but `fetch`, so the scaffold base carries no extra deps.

| File | Backend preset(s) | Browser client to pair |
| --- | --- | --- |
| `external-jwt.ts` → `externalJwtAuthProvider` | `fastapi-sqlalchemy-jwt` (custom JWT) | swap `@/lib/auth-client` → `@/lib/auth-clients/external-jwt` |
| `remote-better-auth.ts` → `remoteBetterAuthProvider` | `hono-drizzle-betterauth`, `hono-prisma-betterauth` (remote better-auth) | **keep** `@/lib/auth-client` as-is (proxy mode, same-origin) |
| `remote-authjs.ts` → `remoteAuthjsProvider` | `hono-drizzle-authjs` (remote Auth.js / NextAuth) | swap `@/lib/auth-client` → `@/lib/auth-clients/authjs` |

## Activate a preset

1. In `../auth-provider.ts`, change the final binding:
   ```ts
   // one of: externalJwtAuthProvider | remoteBetterAuthProvider | remoteAuthjsProvider
   export const authProvider: AuthProvider = remoteBetterAuthProvider;
   ```
2. Set the env var the provider reads — `AUTH_API_URL` (external-JWT) or
   `AUTH_SERVER_URL` (remote better-auth / Auth.js).
3. Swap the browser client to match (except remote better-auth, which keeps the existing
   client):
   ```ts
   // src/lib/auth-client.ts — external-JWT:
   export * from "@/lib/auth-clients/external-jwt";
   // …or Auth.js:
   export * from "@/lib/auth-clients/authjs";
   ```
   The **remote better-auth** preset keeps the existing better-auth client (proxy mode):
   the browser hits this app's same-origin `/api/auth/*` and `handler` proxies to the
   service. (Direct cross-origin mode: point `VITE_BETTER_AUTH_URL` at the service and
   drop the proxy — needs CORS + cross-site cookies.)

The Supabase preset's wiring needs the Supabase SDKs, so it is **not** carried in the
base; it ships as copy-ready files under `backends/supabase/frontend-wiring/`.

See each preset's `.claude/skills/add-backend/references/<preset>.md` and
`backends/CONTRACT.md`.
