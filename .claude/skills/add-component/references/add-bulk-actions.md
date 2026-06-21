# Add bulk row actions

Add multi-row selection to a list and a contextual action bar that applies one
operation to the whole selection (bulk status change, bulk delete, export
selected, …). Built on `DataTable`'s opt-in selection — the capability already
lives in the platform; this shape is the wiring. The full demo is **bundled** at
`templates/bulk-actions.tsx` — copy, don't paste.

## Add one

```bash
cp .claude/skills/add-component/templates/bulk-actions.tsx src/routes/_app/<name>.tsx
```

1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Replace the local `Member`/`SEED` model + columns with your resource's type
   and `ColumnDef`s (or import the resource's `createColumns`).
3. Wire selection on `DataTable`: pass `enableRowSelection`, a controlled
   `rowSelection` + `onRowSelectionChange` (local `useState` — selection is
   transient UI, **not** URL state), and a stable `getRowId={(row) => row.id}`.
4. Pass `selectionActions={(ids) => …}` — the bar renders when ≥1 row is
   selected and receives the selected ids. Route destructive actions through
   `useConfirm()`, then clear the selection (`setRowSelection({})`) and toast.
5. Real resource: back each action with a `Repository` mutation (ideally one
   bulk call, or `Promise.all` over the ids), invalidate the resource's query
   keys on success, and report the outcome with a toast. See
   `src/routes/_app/products.tsx` for the canonical resource-backed wiring.

(Only open the template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/infra/table` (`DataTable` with `enableRowSelection` / `rowSelection` /
`onRowSelectionChange` / `getRowId` / `selectionActions`), `@/infra/ui`
(`StatusChip`), `@/components/ui/{button,confirm-dialog}` (`useConfirm`),
`@/lib/toast` (`toast`), and the page-shell heading. The demo drives `DataTable`
over local state; a real page swaps in `useResourceList` + server fns.

## Invariants

- Selection lives in **local `useState`** (`rowSelection`), never the URL — it is
  transient UI, unlike list/sort/filter/page state.
- `getRowId` returns a stable per-row id so the selection survives re-paging.
- The action bar appears only when ≥1 row is selected and operates on the exact
  selected ids; clear the selection after a successful action.
- Destructive bulk actions go through `useConfirm()`; every action reports a
  toast, and real mutations invalidate the resource's query keys.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — select rows with the
checkboxes (and the header select-all); the action bar shows the count;
Activate/Pause update the rows and clear the selection; Delete confirms first;
each action toasts.
