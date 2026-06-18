# CLAUDE.md

A full-stack back-office / dashboard starter ("中台" template) for shipping SaaS and internal-tool backends faster. This file orients AI agents working in the repo.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) — full-stack React on Vite + Nitro. Server logic runs in **server functions** created with `createServerFn` from `@tanstack/react-start`.
- **Routing**: [TanStack Router](https://tanstack.com/router) — file-based, type-safe routes under `src/routes/`. Route tree is generated into `src/routeTree.gen.ts` (do not edit by hand).
- **Server state**: [TanStack Query](https://tanstack.com/query) — caching + mutations, SSR-integrated via `@tanstack/react-router-ssr-query`.
- **Tables**: [TanStack Table](https://tanstack.com/table) — headless, wrapped by the generic `DataTable` in `src/infra/table`.
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-orm/node-postgres`). Schema in `src/db/schema.ts`; client in `src/db/index.ts`. Migrations in `./drizzle`, managed with `drizzle-kit`.
- **Auth**: [better-auth](https://www.better-auth.com/) — email + password, sessions persisted in Postgres via the Drizzle adapter (`usePlural: true`), cookies via the `tanstackStartCookies` plugin (must be the LAST plugin). Real hashed passwords. Config in `src/lib/auth.ts`.
- **UI**: [shadcn/ui](https://ui.shadcn.com/) components built on **[`@base-ui/react`](https://base-ui.com/) (NOT Radix)**, in `src/components/ui`. **Tailwind CSS v4**, **Phosphor icons** (`@phosphor-icons/react`), light/dark via `next-themes`.
- **Charts**: Recharts. **Client state**: Zustand. **Validation**: Zod (v4).
- **Tooling**: **Bun** (package manager + script runtime), **Biome** (lint + format), **Vitest**. **TypeScript** strict, path alias `@/*` → `./src/*`.

Build pipeline: Vite (`vite.config.ts`) wires `tanstackStart()`, `nitroV2Plugin({ preset: "node-server" })`, `tailwindcss()`, `viteReact()`, and tsconfig paths. Dev server runs on port 3000.

## Architecture

### Routing & auth guard

File-based routes live in `src/routes/`:

- `__root.tsx` — HTML shell, head, providers (`next-themes`).
- `_app.tsx` — **auth-guarded layout**. Its `beforeLoad` calls `getSession()` (a server fn) and `throw redirect({ to: "/login" })` if there's no session; otherwise it returns `{ user }` into the route context. All protected pages live under `src/routes/_app/`.
- `_auth.tsx` — public auth layout; its `beforeLoad` redirects already-authenticated users to `/`. Children: `login`, `register`.
- `api/auth/$.ts` — mounts better-auth's HTTP handler (`auth.handler`) for `GET`/`POST`.

Server-side session helpers are in `src/lib/auth-server.ts`:
- `getSession()` — a `createServerFn` reading the better-auth session; use in route `beforeLoad`/loaders.
- `requireUser()` — asserts an authenticated user; **call at the top of every mutating/protected server-fn handler**. Throws `"UNAUTHORIZED"` if there is no session.

The browser auth client (`signIn`, `signUp`, `signOut`, `useSession`) is in `src/lib/auth-client.ts`.

### The resource pattern (most important convention)

Every data resource is a self-contained folder under `src/features/<name>/`, paired with a route under `src/routes/_app/<name>.tsx` that renders the generic `DataTable`. **`products` is the canonical example — copy it.** A resource folder contains:

| File | Responsibility |
| --- | --- |
| `schema.ts` | Zod schemas + inferred types: input, update, and list-params (page/pageSize/search/sort/filter). |
| `server.ts` | `createServerFn` handlers (`list*`, `get*`, `create*`, `update*`, `delete*`). Each calls `requireUser()`, validates input via `.validator(...)` with the Zod schema, and uses Drizzle. List uses a **whitelist of sortable columns** (never sort by raw user input), `ilike` search, `count()` for total, and offset pagination. Returns `{ rows, total }`. |
| `queries.ts` | TanStack Query glue: a `*Keys` factory, a `*ListQuery(params)` returning `queryOptions`, and `useCreate*`/`useUpdate*`/`useDelete*` mutation hooks that invalidate the resource's keys on success. |
| `columns.tsx` | `ColumnDef[]` factory taking a context (`onEdit`/`onDelete`). Uses shared cells from `@/infra/ui` (`StatusChip`, `ActionMenu`). |
| `config.ts` | Filter definitions (`FilterConfig[]`) and table config (search placeholder, page-size options, empty message). |

The DB table itself goes in `src/db/schema.ts` alongside `products`.

### The generic `DataTable`

`src/infra/table/DataTable.tsx` is a **fully-controlled, server-driven** table. The page component owns all state (page, pageSize, search, status filter, sorting) — typically via `useState` plus a TanStack Query `useQuery` — and passes it down. The table uses `manualPagination`/`manualSorting`/`manualFiltering` (server does the work). It composes `TableToolbar` (search + filters + refresh) and `TablePaginationControls`. See `src/routes/_app/products.tsx` for the reference wiring, including the create/edit dialog.

### Sidebar

Navigation is configured in `src/lib/sidebar-items.ts` (`mainMenuItems`, `bottomMenuItems`). New resources add an item to `mainMenuItems`; the line `// create-resource:anchor` marks where the generator inserts entries.

## How to add a resource

1. Add a Drizzle table to `src/db/schema.ts`; run `bun run db:generate` then `bun run db:migrate`.
2. Create `src/features/<name>/` with `schema.ts`, `server.ts`, `queries.ts`, `columns.tsx`, `config.ts` (copy from `products`).
3. Add a route `src/routes/_app/<name>.tsx` that wires `DataTable` (copy from `src/routes/_app/products.tsx`).
4. Add a sidebar entry in `src/lib/sidebar-items.ts`.

Or run `bun run create-resource <name>` to scaffold all of the above — it also appends the Drizzle table to `src/db/schema.ts`; after generating, customise the fields and run `bun run db:generate && bun run db:migrate`. Full walkthrough: `docs/resources.md`.

## Key conventions

- **Always** call `requireUser()` inside protected server-fn handlers; **never** trust raw client input — validate with Zod via `.validator(...)`.
- Server functions are imported and called directly from query/mutation hooks (`fn({ data })`) — no manual fetch/REST layer.
- Keep the route tree generated; don't hand-edit `src/routeTree.gen.ts`.
- Use the `@/*` alias for imports. Run `bun run check` (Biome) before finishing.
- Don't reintroduce Next.js, Hero UI, TypeORM, or Refine — none are used. shadcn/ui here is built on `@base-ui/react`, not Radix.

## Commands

- `bun run dev` — dev server (port 3000).
- `bun run db:up` / `bun run db:down` — start/stop local Postgres (Docker Compose).
- `bun run db:generate` / `db:migrate` / `db:push` / `db:studio` — Drizzle migrations & Studio.
- `bun run db:seed` — seed demo products.
- `bun run build` / `bun run start` — production build / run Nitro server.
- `bun run check` / `lint` / `format` — Biome.

See `README.md` for full setup and `docs/resources.md` for the resource guide.
