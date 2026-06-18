# Open Dashboard

> Stop building the same back-office dashboard for the hundredth time. Start shipping faster.

If you're like most developers, you've built the admin/back-office dashboard for a SaaS or internal tool a dozen times. It's always the same plumbing: auth, sessions, CRUD tables, pagination, filtering, settings. It gets repetitive — and most starters out there are either pretty UI kits with no real backend, or a tangle of half-wired boilerplate.

**Open Dashboard** is different. It's an open-source, **full-stack**, production-ready starter (a "中台" / back-office template) built on **TanStack Start**, **Drizzle ORM + PostgreSQL**, and **better-auth**. Real database, real hashed-password auth, real server-side data tables — not mock data.

![preview](https://s2.loli.net/2025/10/10/KyioHSd8blFvTjA.png)

## Why This Template?

### It's a real full-stack app, not a static UI kit

Server functions (`createServerFn`) talk to PostgreSQL through Drizzle ORM. Authentication is handled by better-auth with sessions persisted in Postgres and real password hashing. The dashboard you clone actually works end to end.

### A "LEGO" resource pattern

Every data resource (the `products` example) lives in a single self-contained folder under `src/features/<name>/` — schema, server functions, query hooks, table columns, and config — and renders through one generic `DataTable`. Adding a new CRUD resource is mostly copy-paste-and-rename. There's even a generator: `bun run create-resource <name>`.

### Type-safe from the database to the route

Drizzle infers row types, Zod validates every server-function input, and TanStack Router gives you fully type-safe file-based routes and loaders. The `@/*` path alias keeps imports clean.

## Features

- **Full-stack CRUD** — the Products page is a complete, server-backed resource (list, create, edit, delete) with **server-side pagination, sorting, search, and status filtering** against PostgreSQL.
- **Authentication** — email + password sign-up / sign-in via better-auth, sessions in Postgres, route guards. Logged-out users are redirected to `/login`; logged-in users are redirected away from auth pages.
- **Generic `DataTable`** — one fully-controlled, server-driven table component (TanStack Table) reused by every resource.
- **Dashboard overview** — charts and KPI cards built with Recharts.
- **Command palette** (⌘K) for fast navigation.
- **Themeable UI** — shadcn/ui components built on [`@base-ui/react`](https://base-ui.com/), Tailwind CSS v4, light/dark mode, Phosphor icons.
- **Resource generator** — `bun run create-resource <name>` scaffolds a new feature folder, route, and sidebar entry.
- **End-to-end type safety** — Drizzle + Zod + TanStack Router.

## Tech Stack

### Full-stack framework

- **[TanStack Start](https://tanstack.com/start)** — full-stack React framework (Vite + Nitro), with server functions via `createServerFn`.
- **[TanStack Router](https://tanstack.com/router)** — type-safe, file-based routing.
- **[TanStack Query](https://tanstack.com/query)** — server-state caching and mutations.
- **[TanStack Table](https://tanstack.com/table)** — headless table primitives.
- **React 19** + **TypeScript 5** (strict mode).
- **[Vite 7](https://vite.dev/)** as the dev server and bundler; **Nitro** (`node-server` preset) for the production server.

### Database & auth

- **[Drizzle ORM](https://orm.drizzle.team/)** + **PostgreSQL** (via `node-postgres`).
- **[drizzle-kit](https://orm.drizzle.team/kit-docs/overview)** for migrations and Studio.
- **[better-auth](https://www.better-auth.com/)** — email + password, sessions persisted in Postgres via the Drizzle adapter, cookies handled by the `tanstackStartCookies` plugin.

### UI & state

- **[shadcn/ui](https://ui.shadcn.com/)** built on **[`@base-ui/react`](https://base-ui.com/)** (not Radix).
- **Tailwind CSS v4** + **tw-animate-css**.
- **[Phosphor Icons](https://phosphoricons.com/)**.
- **[Recharts](https://recharts.org/)** for data visualization.
- **[Zustand](https://zustand-demo.pmnd.rs/)** for client state.
- **[Zod](https://zod.dev/)** for schema validation.
- **[next-themes](https://github.com/pacocoursey/next-themes)** for light/dark theming.

### Tooling

- **[Bun](https://bun.sh/)** — package manager and script runtime.
- **[Biome](https://biomejs.dev/)** — linter and formatter.
- **Vitest** for tests.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (for local PostgreSQL)

### 1. Install dependencies

```bash
bun install
```

### 2. Start PostgreSQL

Use Docker Compose (recommended):

```bash
bun run db:up        # docker compose up -d
```

…or run a one-off container directly:

```bash
docker run -d --name open-dashboard-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=open_dashboard \
  -p 5432:5432 \
  postgres:17-alpine
```

### 3. Configure environment

```bash
cp .env.example .env
```

The defaults in `.env.example` match the Docker setup above. For production, generate a real secret:

```bash
openssl rand -base64 32   # set as BETTER_AUTH_SECRET
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `BETTER_AUTH_SECRET` | Secret used to sign sessions. |
| `BETTER_AUTH_URL` | Server-side base URL (e.g. `http://localhost:3000`). |
| `VITE_BETTER_AUTH_URL` | Public base URL exposed to the browser auth client. |

### 4. Migrate and seed the database

```bash
bun run db:migrate   # apply migrations in ./drizzle
bun run db:seed      # insert ~60 demo products
```

### 5. Start the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account on `/register`, then explore the dashboard and the Products page.

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start the Vite dev server on port 3000. |
| `bun run build` | Build for production. |
| `bun run start` | Run the built Nitro server (`node .output/server/index.mjs`). |
| `bun run serve` | Preview the production build with Vite. |
| `bun run check` | Run Biome checks (lint + format). |
| `bun run lint` | Run the Biome linter. |
| `bun run format` | Format the codebase with Biome. |
| `bun run db:up` | Start PostgreSQL via Docker Compose. |
| `bun run db:down` | Stop the Docker Compose stack. |
| `bun run db:generate` | Generate a migration from the Drizzle schema. |
| `bun run db:migrate` | Apply pending migrations. |
| `bun run db:push` | Push the schema directly to the database (no migration files). |
| `bun run db:studio` | Open Drizzle Studio. |
| `bun run db:seed` | Seed the database with demo products. |
| `bun run create-resource <name>` | Scaffold a new resource (feature folder + route + sidebar entry). |

## Project Structure

```
open-dashboard/
├── drizzle/                 # Generated SQL migrations
├── docs/
│   └── resources.md         # Guide: how to add a new resource
├── scripts/
│   ├── seed.ts              # Demo data seeder (bun run db:seed)
│   └── create-resource.ts   # Resource generator (bun run create-resource)
├── src/
│   ├── components/          # App shell + shadcn/ui components (components/ui)
│   ├── db/
│   │   ├── index.ts         # Drizzle client (node-postgres Pool)
│   │   └── schema.ts        # Drizzle tables (auth tables + products)
│   ├── features/
│   │   └── products/        # Canonical resource: schema/server/queries/columns/config
│   ├── infra/
│   │   ├── table/           # Generic DataTable + toolbar + pagination
│   │   └── ui/              # Shared cells (StatusChip, ActionMenu)
│   ├── lib/
│   │   ├── auth.ts          # better-auth server instance
│   │   ├── auth-client.ts   # better-auth React client
│   │   ├── auth-server.ts   # getSession / requireUser server helpers
│   │   └── sidebar-items.ts # Sidebar navigation config
│   ├── routes/              # File-based TanStack routes
│   │   ├── __root.tsx       # Root document + providers
│   │   ├── _app.tsx         # Auth-guarded layout (dashboard shell)
│   │   ├── _app/            # Protected pages (index, products)
│   │   ├── _auth.tsx        # Public auth layout
│   │   ├── _auth/           # login, register
│   │   └── api/auth/$.ts    # better-auth HTTP handler
│   ├── router.tsx           # Router + QueryClient setup
│   └── styles/              # Tailwind entry
├── docker-compose.yml       # Local Postgres
├── drizzle.config.ts        # drizzle-kit config
└── vite.config.ts           # Vite + TanStack Start + Nitro plugins
```

## Adding a Resource

The `products` feature is the canonical example. To add your own CRUD resource, copy `src/features/products/` and adapt it (schema → server functions → query hooks → columns → config → route → sidebar entry), or run the generator:

```bash
bun run create-resource orders
```

The generator scaffolds the feature folder, the `src/routes/_app/<name>.tsx` route, a Drizzle table in `src/db/schema.ts`, and a sidebar entry — then you customise the fields and run `bun run db:generate && bun run db:migrate`.

See **[docs/resources.md](./docs/resources.md)** for the full walkthrough.

## Deployment

Build and run the production Nitro server:

```bash
bun run build
bun run start   # node .output/server/index.mjs
```

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `VITE_BETTER_AUTH_URL` in your hosting environment, and run `bun run db:migrate` against your production database before first boot.

## Contributing

Contributions are welcome — open issues, submit PRs, and star the repo if it helps you.

## License

MIT.
