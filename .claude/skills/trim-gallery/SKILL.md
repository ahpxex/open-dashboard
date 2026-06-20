---
name: trim-gallery
description: Remove the UI-shape gallery (all of it, or all but the variants your product keeps) — gallery routes, their local components, the tabbed Overview, and its single sidebar entry. Use when porting the template into a real product, after deciding which shapes you need.
---

# Trim the gallery

`src/routes/_app/gallery/*` ships a broad **palette** of admin UI shapes so an
agent can compose from them. They are surfaced as the **Skills Gallery** in the
sidebar — an `Overview` entry (`gallery/index.tsx`, a tabbed catalogue) plus
per-category groups (`Skills · Forms`, `Skills · Lists & tables`, …), one entry
per skill. A real product keeps a few shapes and deletes the rest. Every variant
is self-contained, so trimming is mostly deletion.

## What the gallery is made of

- **Routes**: every file under `src/routes/_app/gallery/` (one per variant) plus
  `gallery/index.tsx`, the tabbed Overview. The individual demos are **not**
  separate sidebar entries — they are rows in the `SHAPES` array inside
  `gallery/index.tsx`.
- **Gallery-only modules**: each shape's reusable piece lives outside the route
  file and is imported **only** by a gallery demo. The full set (each also the
  template source of its `add-*` skill):
  - `src/components/data/*`, `src/components/feedback/*`
  - `src/components/form/ComboboxField.tsx` (add-field-combobox),
    `src/components/form/FileField.tsx` + `src/infra/storage/` (add-file-upload)
  - `src/infra/table/ColumnControls.tsx` (add-table-columns),
    `src/infra/table/SavedViews.tsx` (add-saved-views),
    `src/infra/data/csv.ts` (add-export-import)
  - `src/components/GlobalSearch.tsx` (add-global-search),
    `src/components/NotificationCenter.tsx` (add-notifications),
    `src/components/RoleGate.tsx` + `src/lib/rbac.ts` (add-rbac),
    `src/lib/i18n.tsx` (add-i18n), `src/lib/use-live-query.ts` (add-realtime),
    `src/components/billing/` (add-billing), `src/components/auth/` (add-auth-method)
- **Sidebar**: the `Skills Gallery` group plus every `Skills · …` group in
  `src/lib/sidebar-items.ts` (below the `// gallery:anchor` line). The
  **business-case groups above** that line (`E-commerce`, `Sales (CRM)`) are NOT
  the gallery — leave them.
- **Docs**: `docs/gallery-catalogue.md`.

Outside the gallery routes, nothing imports these modules — **unless you've
already adopted one via its `add-*` skill** (e.g. you ran add-file-upload, so a
real feature now imports `FileField`). Keep any module a feature you're keeping
still imports; drop the rest. The rest of the platform (`src/infra` core, the
form system, `src/components/ui`, charts) is **not** part of the gallery — keep it.

## Remove the whole gallery

Delete the routes, the Overview's doc, and every gallery-only module (skip any
you've adopted via an `add-*` skill — see the note above):

```
rm -rf src/routes/_app/gallery src/components/data src/components/feedback \
       src/components/billing src/components/auth src/infra/storage
rm -f  src/components/form/ComboboxField.tsx src/components/form/FileField.tsx \
       src/infra/table/ColumnControls.tsx src/infra/table/SavedViews.tsx \
       src/infra/data/csv.ts src/components/GlobalSearch.tsx \
       src/components/NotificationCenter.tsx src/components/RoleGate.tsx \
       src/lib/rbac.ts src/lib/i18n.tsx src/lib/use-live-query.ts \
       docs/gallery-catalogue.md
```

Then in `src/lib/sidebar-items.ts` delete the `Skills Gallery` group and every
`Skills · …` group (everything below the `// gallery:anchor` line). Verify
(typecheck flags any module a kept feature still needs — re-add only those):

```
bun run typecheck && bun run check && bun run test && bun run build
```

## Keep some, trim the rest

The Overview is data-driven by the `SHAPES` array in `gallery/index.tsx`, so
trimming a shape is a few steps:

1. In `gallery/index.tsx`, remove the entries you don't keep from the `SHAPES`
   array (and any now-unused `CATEGORIES` entry / icon import).
2. Delete the matching route file under `src/routes/_app/gallery/` for each removed
   shape (and the gallery-only module only that shape used — see the inventory
   above).
3. Also remove that shape's sidebar item from its `Skills · …` group in
   `src/lib/sidebar-items.ts`. Keep the `Skills Gallery` Overview entry as long as
   ≥1 shape remains; if you remove every shape, delete `gallery/index.tsx` and all
   Skills groups, then follow "Remove the whole gallery" above.
4. Verify with the four commands above; `bun run dev` and open `/gallery` to click
   each kept card.

## Invariants

- Trimming the gallery never touches the business-case groups or platform
  layers — each gallery variant is already independent.
- After trimming, the app boots zero-config (in-memory backend) and all four
  checks pass on the slimmed-down shell.
