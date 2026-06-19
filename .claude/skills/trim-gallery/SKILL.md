---
name: trim-gallery
description: Remove the UI-shape gallery (all of it, or all but the variants your product keeps) — gallery routes, their local components, the tabbed Overview, and its single sidebar entry. Use when porting the template into a real product, after deciding which shapes you need.
---

# Trim the gallery

`src/routes/_app/gallery/*` ships a broad **palette** of admin UI shapes so an
agent can compose from them. They are surfaced through a **single sidebar entry**
(`Gallery · Overview`, `gallery/index.tsx`) — a tabbed catalogue whose cards link
to each demo. A real product keeps a few shapes and deletes the rest. Every
variant is self-contained, so trimming is mostly deletion.

## What the gallery is made of

- **Routes**: every file under `src/routes/_app/gallery/` (one per variant) plus
  `gallery/index.tsx`, the tabbed Overview. The individual demos are **not**
  separate sidebar entries — they are rows in the `SHAPES` array inside
  `gallery/index.tsx`.
- **Gallery-only components**: `src/components/data/*`, `src/components/feedback/*`,
  and `src/components/form/ComboboxField.tsx` (used only by gallery demos).
- **Sidebar**: the single `Gallery` group in `src/lib/sidebar-items.ts` (just below
  the `// gallery:anchor` line). The **business-scenario groups above** that line
  (`taoracle`, `E-commerce`, `Helpdesk`, …) are NOT the gallery — leave them.
- **Docs**: `docs/gallery-catalogue.md`.

Nothing else in the app imports these. Platform code (`src/infra`, the form
system, `src/components/ui`, charts) is **not** part of the gallery — keep it.

## Remove the whole gallery

```
rm -rf src/routes/_app/gallery src/components/data src/components/feedback
rm -f  src/components/form/ComboboxField.tsx docs/gallery-catalogue.md
```

Then in `src/lib/sidebar-items.ts` delete the `Gallery` group (the one whose
`groupLabel` is `"Gallery"`) and the `// gallery:anchor` line. Verify:

```
bun run typecheck && bun run check && bun run test && bun run build
```

## Keep some, trim the rest

The Overview is data-driven by the `SHAPES` array in `gallery/index.tsx`, so
trimming is two steps:

1. In `gallery/index.tsx`, remove the entries you don't keep from the `SHAPES`
   array (and any now-unused `CATEGORIES` entry / icon import).
2. Delete the matching route file under `src/routes/_app/gallery/` for each removed
   shape (and any `components/data` / `components/feedback` component only that
   shape used).
3. Keep the single `Gallery` sidebar entry as long as ≥1 shape remains; if you
   remove every shape, delete `gallery/index.tsx`, the `Gallery` sidebar group, and
   follow "Remove the whole gallery" above.
4. Verify with the four commands above; `bun run dev` and open `/gallery` to click
   each kept card.

## Invariants

- Trimming the gallery never touches the business-scenario groups or platform
  layers — each gallery variant is already independent.
- After trimming, the app boots zero-config (in-memory backend) and all four
  checks pass on the slimmed-down shell.
