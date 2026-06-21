# Add a kanban board

A board is a list grouped by a status field, with drag-to-change-status. The full
component is **bundled** at `templates/kanban.tsx` — you don't paste code from here.

## Add one

```bash
cp .claude/skills/add-component/templates/kanban.tsx src/routes/_app/<name>.tsx
```

Then in the copied file:
1. Set the `createFileRoute("/_app/<name>")` path to match the file path.
2. Set `COLUMNS` to your status enum and the card/`KanbanCard` shape.
3. Real resource: group a `Repository` list by status into the board, and in
   `handleDragEnd` (when `start !== to`) call `update(cardId, { status: to })`
   optimistically (toast/roll back on error) instead of only mutating local state.
   Persist intra-column order too if your records carry a sort/position field.

(Only open the template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (shipped in the base),
`@/components/ui/{card,badge}`, `@/lib/toast`, `@/lib/utils` (`cn`),
`@phosphor-icons/react`, the page-shell heading, and theme tokens — all provided by
the base (see the `scaffold-dashboard` skill). If `@dnd-kit/*` isn't installed,
`bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.

## Invariants

- One status enum drives the columns; a card's column IS its status; moving a card
  between columns persists the new status. Built on **dnd-kit** (pointer + keyboard
  accessible), with cross-column moves AND intra-column reordering, a live insertion
  gap, and a lifted `DragOverlay`. Theme tokens only.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — drag a card between
columns and confirm it sticks.
