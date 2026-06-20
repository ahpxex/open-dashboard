# Add roles & permissions (RBAC)

The template ships **authentication** (who you are) but no **authorization** (what
you may do). This adds a small, explicit role/permission model. The pieces are
**bundled** — copy, don't paste:

- `templates/rbac.ts` → `src/lib/rbac.ts` — `Role`/`Permission` unions, the
  `ROLE_PERMISSIONS` matrix, pure `hasRole`/`can` helpers, and the server guards
  `requireRole`/`requirePermission` (throw `"FORBIDDEN"`). Dependency-free and
  client-safe.
- `templates/RoleGate.tsx` → `src/components/RoleGate.tsx` — `<RoleGate role={…}
  can="…" allow={[…]} fallback={…}>` to gate UI.
- `templates/rbac.tsx` → `src/routes/_app/gallery/rbac.tsx` — the live demo (role
  switcher + gated toolbar/row actions + a RoleGate'd settings panel).

## Add it

```bash
cp .claude/skills/add-component/templates/rbac.ts src/lib/rbac.ts
cp .claude/skills/add-component/templates/RoleGate.tsx src/components/RoleGate.tsx
```

Then wire roles into the real stack:

1. **Store the role.** Add a `role` column to the users table in
   `src/db/schema.ts` (`text("role").notNull().default("viewer")`), then
   `bun run db:generate && bun run db:migrate`. Edit the `Role`/`Permission`
   unions and the `ROLE_PERMISSIONS` matrix to your real roles.
2. **Gate the server.** In a protected server fn, after `requireUser()`, resolve
   the caller's role (read the `role` column for `user.id`) and call
   `requireRole(role, ["admin", "editor"])` or
   `requirePermission(role, "resource:delete")`. This is the real boundary.
3. **Gate the UI.** Use `can(role, permission)` to disable buttons and
   `<RoleGate role={role} can="settings:manage">…</RoleGate>` to hide whole
   panels. Surface the role from the route context (`_app.tsx` already returns
   `{ user }` in `beforeLoad` — extend it to include `role`).

(Only open a template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/components/ui/{button,card,badge,switch,separator,table}`, `@/lib/toast`,
`@phosphor-icons/react`, the auth seam (`requireUser`), and the page-shell
heading — all provided by the base.

## Invariants

- The `ROLE_PERMISSIONS` matrix is the single source of truth — gate against it,
  never scatter `if (role === "admin")` checks.
- **UI gating is UX, not security.** Always re-check on the server with
  `requireRole`/`requirePermission` (fails closed with `"FORBIDDEN"`).
- `rbac.ts` stays client-safe (no `@/db`/`@/lib/auth` imports) so `can`/`hasRole`
  run in the browser; the handler passes the role into `requireRole`.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — open
`/gallery/rbac`, flip the role, and confirm Create/Edit/Delete enable/disable and
the settings panel shows only for admin.
