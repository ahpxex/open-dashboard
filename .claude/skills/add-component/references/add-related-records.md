# Add related records

A parent record and its related children on one page — the inline counterpart to
`add-master-detail` (list + side panel) and `add-record-tabs` (children in tabs).
The generic `RelatedList` (a titled, compact table) and a showcase page are
**bundled** under `templates/` — copy, don't paste.

## Add it

```bash
cp .claude/skills/add-component/templates/RelatedList.tsx src/components/data/RelatedList.tsx
# Optional: a gallery page showcasing a parent + two related lists
cp .claude/skills/add-component/templates/related-records.tsx src/routes/_app/<name>.tsx
```

Then:
1. Pair with `add-detail-page`: on `/<parent>/$id`, load the parent record
   (DescriptionList header) and render one `<RelatedList>` per child resource.
2. For each child, query its **own list query filtered by the parent id**
   (`<child>ListQuery({ filters: { <parentId>: id } })`) and pass the rows in —
   `RelatedList` is presentational, it does no fetching.
3. Give each list `title`, `columns` (`{ header, cell, align? }`), `rowKey`, and
   optionally `viewAll={{ to }}` (deep-link to the filtered child list) and
   `rowAction` (a link / `ActionMenu`). Status cells: `StatusChip`.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/table`, `@/infra/ui` (`StatusChip`, `DescriptionList` for the
showcase header), `@/lib/utils` (`cn`), `@tanstack/react-router` (`Link`),
`@phosphor-icons/react`, the page-shell heading, and theme tokens — all provided
by the base (see the `scaffold-dashboard` skill).

## Invariants

- `RelatedList` is presentational and generic over the row type — pass
  already-fetched, parent-scoped rows; never fetch inside it.
- Children load via their own resource's list query filtered by the parent id —
  not a bespoke join. Theme tokens only.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — the parent header and
both related tables render, with a clean empty state when a list is empty.
