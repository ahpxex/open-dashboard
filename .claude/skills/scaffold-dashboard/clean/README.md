# App

A back-office app scaffolded from the **Open Dashboard** platform — a full-stack
starter on [TanStack Start](https://tanstack.com/start),
[Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL, and
[better-auth](https://www.better-auth.com/). The platform shell is in place; build
your product by composing screens with the `add-*` skills.

## Quick start

### Zero-config (no database)

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Dev quick
login"**. The app runs on in-memory adapters — no Docker, no Postgres needed.

### With PostgreSQL

```bash
bun run db:up        # start Postgres (Docker)
cp .env.example .env
bun run db:migrate
bun run db:seed      # dev login account: dev@example.com / password
bun run dev
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Omit it to run on the in-memory backend. |
| `BETTER_AUTH_SECRET` | Secret used to sign sessions (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | Server-side base URL (e.g. `http://localhost:3000`). |
| `VITE_BETTER_AUTH_URL` | Public base URL for the browser auth client. |

## Building your app

1. **Rebrand** — set the name / logo / nav / theme in `src/config/app.ts` (the `rebrand` skill).
2. **Add resources** — `bun run create-resource <name>` scaffolds a full CRUD vertical (Drizzle table + server fns + query hooks + `DataTable` page + create/edit dialog + sidebar entry). Customise the fields, then `bun run db:generate && bun run db:migrate`.
3. **Add screens** — compose detail pages, master-detail, card lists, kanban boards, charts, wizards, billing, etc. with the matching `add-*` skills.
4. **Pick a backend** — keep the zero-config in-memory backend, set `DATABASE_URL` for Postgres, or swap a preset (Supabase / external API) via the `add-backend-preset` skill.

Architecture and the prescriptive conventions live in [`CLAUDE.md`](./CLAUDE.md).

## Tech stack

TanStack Start (Vite + Nitro) · TanStack Router / Query / Table · Drizzle ORM +
PostgreSQL · better-auth · shadcn/ui on `@base-ui/react` (not Radix) · Tailwind CSS
v4 · Phosphor icons · Recharts · Zustand · Zod · Bun · Biome · Vitest · TypeScript.

## Project structure

```
src/
├── components/   # app shell, charts, form system, shadcn/ui (components/ui)
├── config/       # app.ts — the single rebrand surface (name / logo / nav / theme)
├── db/           # Drizzle schema + client
├── features/     # your resources (one folder each: schema/server/queries/columns/config)
├── infra/        # Repository + adapters, the generic DataTable / CardList
├── lib/          # auth seam, sidebar config, toast, helpers
├── routes/       # file-based routes (_app = protected, _auth = login/register)
└── styles/       # Tailwind entry
```

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Dev server on port 3000 (zero-config if no `DATABASE_URL`). |
| `bun run build` / `start` | Production build / run the Nitro server. |
| `bun run check` / `lint` / `format` | Biome. |
| `bun run typecheck` / `test` | `tsc --noEmit` / Vitest. |
| `bun run db:up` / `db:down` / `db:generate` / `db:migrate` / `db:studio` / `db:seed` | Postgres + Drizzle. |
| `bun run create-resource <name>` | Scaffold a CRUD resource. |

## Deployment

```bash
bun run build
bun run start   # node .output/server/index.mjs
```

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and
`VITE_BETTER_AUTH_URL` in your hosting environment, and run `bun run db:migrate`
before first boot.
