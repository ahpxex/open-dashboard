# Preset: FastAPI + SQLAlchemy + JWT (standalone Python service)

A standalone Python service: the `products` resource as a **json-server-dialect REST API**
(with `X-Total-Count`) + a **custom HS256-JWT** auth surface `/auth/{register,login,me,
logout}` (CONTRACT §2a). The frontend reaches it via `restRepository` (data) and the
shipped `externalJwtAuthProvider` (auth) — no UI changes. This is the cross-language proof.

## Add it

1. **Stand up the service** (uses `uv`; `uv`/`pip` need the proxy, the service does not):
   ```bash
   cp -R .claude/skills/add-backend/templates/fastapi-sqlalchemy-jwt <dest> && cd <dest>
   http_proxy=http://127.0.0.1:7890 https_proxy=http://127.0.0.1:7890 no_proxy=localhost,127.0.0.1,::1 \
     uv venv --python 3.12 && uv pip install -e ".[dev]"
   uv run uvicorn app.main:app --port 8000      # zero-config SQLite (./app.db), docs at /docs
   ```
   Set `DATABASE_URL` for Postgres (`.[postgres]` extra); `AUTH_JWT_SECRET` fails closed in
   production.
2. **Data** — in `src/features/products/server.ts`, bind
   `restRepository({ baseUrl: process.env.PRODUCTS_API_URL!, path: "/products", map: (r) => r })`.
   The wire JSON already equals `Product` (camelCase, ISO timestamps); defaults match the
   dialect, so no `params`/`totalHeader` override.
3. **Auth** — activate the shipped provider + matching client:
   ```ts
   // src/lib/auth-provider.ts
   import { externalJwtAuthProvider } from "@/lib/auth-providers/external-jwt";
   export const authProvider: AuthProvider = externalJwtAuthProvider;
   // src/lib/auth-client.ts
   export * from "@/lib/auth-clients/external-jwt";
   ```
   Set `AUTH_API_URL=http://localhost:8000`. The frontend owns the `session` cookie (the
   token is returned in the JSON body); `getSession` validates via `GET /auth/me`.
4. Frontend env: `PRODUCTS_API_URL` + `AUTH_API_URL` (this service's origin).

## Foundation it assumes

`restRepository` (`@/infra/data`), `src/lib/auth-providers/external-jwt.ts` +
`src/lib/auth-clients/external-jwt.ts` (ship in the base, typechecked + unit-tested).
CONTRACT.md §1 (data) + §2a (auth). `uv` + Python ≥ 3.11 for the service.

## Invariants

- json-server dialect verbatim + `X-Total-Count`; CORS exposes it; sort/search/filter
  honor the whitelists (parameterized — never raw SQL).
- Passwords bcrypt-hashed; JWT is HS256 with `AUTH_JWT_SECRET` (insecure dev fallback,
  fail-closed in prod). The token lives only in the frontend's HttpOnly cookie.
- The frontend never sends auth on data calls (the fetch runs inside a server fn that
  already called `requireUser()`).

## Verify

- **The service**: `uv pip install -e ".[dev]" && uv run pytest -q` (20-test contract
  suite). Boot + smoke: `POST /auth/register` → `{token,user}`; `GET /auth/me` with the
  bearer → `{id,email,name}`; `GET /products` returns a JSON array + `x-total-count`.
- **End-to-end**: run the service + the dashboard `bun run dev` with the env above; sign-in
  then `/products` lists the service's data.
