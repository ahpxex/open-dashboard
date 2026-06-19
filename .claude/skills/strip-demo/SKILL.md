---
name: strip-demo
description: Remove the demo resources (products, orders, posts) and the sample dashboard, leaving a clean, branded shell ready for real resources. Use right after rebranding when starting a real product.
---

# Strip the demo

The demo is intentionally removable.

## Fastest path: the command

```
bun run strip-demo
```

`scripts/strip-demo.ts` does everything below automatically — deletes the demo
feature folders + routes + fake chart data, removes the `products`/`orders` tables
from `src/db/schema.ts` (pruning now-unused imports), removes the demo sidebar
entries (keeping Dashboard + the `// create-resource:anchor`), replaces the sample
dashboard with a minimal welcome page, rewrites the seed to only create the dev
account, and formats the result. It does **not** touch the database.

After running it:

```
bun run db:generate && bun run db:migrate            # drop the demo tables
bun run typecheck && bun run check && bun run test && bun run build
bun run create-resource <name>                       # add your first resource
```

The manual breakdown below documents what the command does (and is the fallback
if you've already customised these files and want to strip by hand).

> **Heads-up — the template now ships business scenarios too.** `bun run
> strip-demo` only removes the original three demos (`products`/`orders`/`posts`)
> and the sample dashboard. The **scenario groups** in the sidebar (`taoracle`,
> `Helpdesk`, `Sales (CRM)`, `People (HR)`, `Fleet (IoT)`, `Typing platform`) and
> the **gallery** are also demo content — see "Business scenarios" below to remove
> the ones you don't want, and run the `trim-gallery` skill for the gallery.

## What is demo vs. platform

**Demo (remove):**
- `src/features/{products,orders,posts}/` and `src/routes/_app/{products,orders,posts}*.tsx`
- The `products`, `orders` tables in `src/db/schema.ts` (and a migration to drop them)
- Sample dashboard content in `src/routes/_app/index.tsx` (the fake STATS/charts)
- `src/lib/dashboard/chart-data.ts`, `scripts/seed.ts` demo seed
- The matching sidebar entries in `src/lib/sidebar-items.ts`

**Platform (keep):** everything in `src/components/*`, `src/infra/*`,
`src/config/*`, `src/lib/*` (auth, toast, utils), the routing shell, the auth
pages, the generator, and `src/db/schema.ts`'s better-auth tables.

## Business scenarios (also demo — remove what you don't need)

The sidebar's scenario groups are self-contained, memory-backed showcases. Each is
removed the same way (no DB migration needed — they have no Drizzle tables):

- Delete the scenario's `features/` folders and routes:
  - **taoracle** → `features/{tasks,users,redemption-codes}/`, `routes/_app/taoracle/`, and restore `routes/_app/index.tsx` (the taoracle overview) to your real dashboard.
  - **E-commerce** (new parts) → `features/{customers,refunds}/`, `routes/_app/{customers,customers_.$id,refunds}.tsx`.
  - **Helpdesk** → `features/tickets/`, `routes/_app/helpdesk/`.
  - **Sales (CRM)** → `features/{deals,contacts,companies}/`, `routes/_app/crm/`.
  - **People (HR)** → `features/{employees,leave-requests}/`, `routes/_app/hr/`.
  - **Fleet (IoT)** → `features/{devices,alerts}/`, `routes/_app/fleet/`.
  - **Typing platform** → `features/{articles,classes,students,scores}/`, `routes/_app/typing/`.
- Delete that scenario's group from `src/lib/sidebar-items.ts`.
- Run the four checks. Nothing else imports a scenario, so removal is clean.

## Steps

1. Delete the demo feature folders + routes listed above.
2. Remove the `products`/`orders` `pgTable` definitions (keep the better-auth
   tables) and run `bun run db:generate && bun run db:migrate` to drop them.
3. Remove the demo sidebar entries (keep the Dashboard item + the
   `// create-resource:anchor`).
4. Replace `src/routes/_app/index.tsx` with a minimal welcome (or your real
   dashboard built via `add-chart-page`).
5. Delete the obsolete tests under the removed feature folders.

## Verify

`bun run typecheck && bun run check && bun run test && bun run build` — all green
on the clean shell. The app boots to a branded, empty dashboard.
