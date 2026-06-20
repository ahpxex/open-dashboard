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

> **Heads-up — the template ships business scenarios + a Skills Gallery too.**
> `bun run strip-demo` removes the core demos (`products`/`orders`/`posts`) and
> the sample dashboard. The **business-case groups** in the sidebar (the
> `Sales (CRM)` vertical and the `Customers`/`Refunds` extras under `E-commerce`)
> and the **Skills Gallery** are also demo content — see "Business scenarios"
> below to remove the ones you don't want, and run the `trim-gallery` skill for
> the Skills Gallery.

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

Two business cases ship as self-contained, memory-backed showcases (no Drizzle
tables, so no DB migration needed to remove them):

- Delete the scenario's `features/` folders and routes:
  - **E-commerce extras** → `features/{customers,refunds}/`, `routes/_app/{customers,customers_.$id,refunds}.tsx` (the `products`/`orders`/`posts` core + the store-overview `index.tsx` are removed by `bun run strip-demo` itself).
  - **Sales (CRM)** → `features/{deals,contacts,companies}/`, `routes/_app/crm/`.
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
