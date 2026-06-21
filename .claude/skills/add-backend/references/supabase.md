# Preset: Supabase (hosted Postgres + PostgREST + Supabase Auth)

A BaaS backend: data in Supabase Postgres over **PostgREST**, auth via **Supabase Auth**.
Supabase does **not** speak the json-server dialect (it uses `Range`/`Content-Range`), so
this preset ships its own thin frontend adapter — `supabaseRepository` + a Supabase
`AuthProvider`. The template is **SQL + config + copy-ready wiring**; there is no service
to run.

## Add it

1. **Schema** — apply the migration + seed to a Supabase project:
   ```bash
   cp -R .claude/skills/add-backend/templates/supabase <dest> && cd <dest>
   supabase start && supabase db reset      # local (needs Docker); or:
   supabase link --project-ref <ref> && supabase db push   # hosted (no Docker)
   ```
   Grab `SUPABASE_URL` + the anon / service-role keys (printed by `supabase start`, or
   Project Settings → API).
2. **Install SDKs + copy the wiring** (not in the base — needs the Supabase SDKs):
   ```bash
   bun add @supabase/supabase-js @supabase/ssr
   ```
   Copy from `templates/supabase/frontend-wiring/`:
   `supabase-repository.ts` → `src/infra/data/supabase-repository.ts`;
   `products.server.ts` → `src/features/products/server.ts`;
   `auth-provider.ts` → `src/lib/auth-providers/supabase.ts`;
   `auth-client.ts` → `src/lib/auth-clients/supabase.ts`.
3. **Wire the seams**: `authProvider = supabaseAuthProvider`;
   `export * from "@/lib/auth-clients/supabase"` in `src/lib/auth-client.ts`.
4. Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (browser+server),
   `SUPABASE_SERVICE_ROLE_KEY` (**server only**); `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` for the browser client.

## Foundation it assumes

The `Repository` + `AuthProvider` seams (the adapter/provider satisfy the same interfaces),
`@supabase/supabase-js` + `@supabase/ssr`. The `products` table mirrors CONTRACT §0 in
snake_case; the adapter maps snake↔camel and coerces `numeric` `price` to a number.

## Invariants

- RLS is **enabled + forced**; only the `authenticated` role gets CRUD, `anon` is denied.
  The `service_role` key bypasses RLS — **server-side only**, never in the browser bundle.
- `supabaseRepository.list` uses `count: "exact"` for the total (replaces `X-Total-Count`);
  sort/search/filter honor the whitelists. `getSession` verifies the JWT via `getUser()`.
- Migrations are idempotent (`db reset` / `db push` replay safely).

## Verify

Verified end-to-end against a **live local Supabase stack** (`supabase start && supabase
db reset`) — the shipped `supabaseRepository` driving real PostgREST + Supabase Auth:

- **Data** (`supabaseRepository`): list total = 12 (seed) with a page of 10; `q` search
  (`mug` → 1); `status` filter; `price` desc sort; `price` coerced to a JS number;
  pagination; create → getOne → update → remove round-trip — all pass.
- **RLS**: anon `select` is denied (`permission denied for table products`);
  `authenticated` reads all 12.
- **Auth**: `signUp` → `signInWithPassword` → `getUser` returns `user_metadata.name`.
- **Schema** (also against a bare Postgres): migration applies + idempotent, RLS forced,
  4 authenticated policies, `updated_at` trigger, check constraints reject bad input.
- **Wiring types**: `supabase-repository.ts` / `auth-provider.ts` / `auth-client.ts`
  typecheck against the real `@supabase/*` types.

To re-run: `supabase start && supabase db reset`, then exercise the wiring (or the
dashboard) against the printed API URL + keys.
