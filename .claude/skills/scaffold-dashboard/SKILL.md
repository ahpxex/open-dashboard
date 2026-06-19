---
name: scaffold-dashboard
description: Stand up the dashboard foundation (the platform layer — UI primitives, form system, charts, Repository + adapters, auth seam, theme, routing shell) into a new project as a zero-config runnable app. Run this FIRST when building a dashboard, then compose screens from the add-* shape skills.
---

# Scaffold the dashboard foundation

The whole foundation is **bundled** at `base/` — a clean, runnable app shell with
no demo content. Materialize it into a new project, then add screens with the
`add-*` skills. You don't read the foundation code — you scaffold it.

## Scaffold

```bash
bash .claude/skills/scaffold-dashboard/scaffold.sh <target-dir>
```

Copies `base/` → target and runs `bun install`. Then:

```bash
cd <target-dir>
bun run dev          # zero-config: in-memory auth + data, no Postgres/Docker
```

Open it, click **Dev quick login** (`dev@example.com` / `password`) → an empty,
branded dashboard.

## What you get

TanStack Start + Router + Query + Table; shadcn-on-`@base-ui/react` primitives;
Tailwind v4 theme; the form system (TanStack Form + zod); chart components; the
`Repository` data layer (in-memory by default, Drizzle/Postgres when `DATABASE_URL`
is set); better-auth behind the `AuthProvider` seam; toast + `useConfirm`; and the
auth-guarded routing shell. Rebrand via `src/config/app.ts` (or the `rebrand` skill).

## Add screens (compose from the shape skills)

Each shape skill copies a bundled template into the new project:

- **Resources** (data + CRUD): `bun run create-resource <name>` (or `add-crud-resource`),
  then `add-detail-page`, `add-master-detail`, `add-card-list`, `add-form`, `add-chart-page`.
- **Shapes**: `add-list-view`, `add-kanban`, `add-tree-view`, `add-calendar`,
  `add-timeline`, `add-virtual-table`, `add-inline-edit`, `add-filter-panel`,
  `add-wizard-form`, `add-field-combobox`, `add-record-tabs`, `add-settings-page`,
  `add-empty-state`, `add-page-layout`, `add-data-display`, `add-feedback-states`.

After copying a template, add a sidebar entry in `src/lib/sidebar-items.ts` (above
the `// create-resource:anchor`) so it shows in the nav.

## Verify

```bash
cd <target-dir>
bun run typecheck && bun run check && bun run test && bun run build
```

All green on the empty shell (and after each screen you add). `bun run dev` boots
zero-config.
