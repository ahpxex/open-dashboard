---
name: add-component
description: Add a copy-ready admin UI building block to a dashboard built on the scaffold-dashboard base — forms (form, wizard, combobox, file upload, inline edit), lists & tables (CRUD list, card grid, infinite/virtual, column controls, filter panel, saved views, CSV export/import), rich views (kanban, calendar, tree, timeline, master-detail), detail & pages (detail/show, record tabs, related records, multi-column layout, settings, chart/dashboard), display & feedback (tags/metadata/progress, empty/loading/error states, notification center, audit trail), and platform features (RBAC, social/magic-link auth, ⌘K global search, i18n, billing, realtime). Each entry has a reference doc with the exact copy + rewire steps.
---

# Add a UI component

A **catalogue + retriever** for the admin UI building blocks. The real code is the
bundled `templates/*` (generated from the substrate's working source — the source
of truth is the code, not this doc). To add a component:

1. Find it in the **catalogue** below.
2. `Read` its reference — `references/<name>.md` — for the exact `cp` command, the
   foundation it assumes, its invariants, and how to verify.
3. Follow that reference: copy the template into a route/component and rewire it.

Every component assumes the **`scaffold-dashboard`** foundation (the platform layer:
UI primitives, the form system, charts, `DataTable`/`CardList`, theme tokens). Run
`scaffold-dashboard` — or work inside a fork of the substrate — first. For a new
data **resource** (table + server fns + page) use the standalone `add-backend`
skill; to point at a different backend use `add-backend`.

## Catalogue

### Forms

- **add-form** — Build a validated form (create/edit dialog or full-page) with TanStack Form + zod and the bound field components. Use whenever you need user input with validation and server-error handling. Ships copy-ready templates. → `references/add-form.md`
- **add-wizard-form** — Add a multi-step wizard / stepper form — fields split across steps with per-step validation, a progress indicator, Back/Next, and a final review + submit. Use for long or onboarding-style flows. → `references/add-wizard-form.md`
- **add-field-combobox** — Add a searchable single-select (combobox) form field — a popover with a filter input over options, bound to the form system. Use when a plain select has too many options or needs search/async loading. → `references/add-field-combobox.md`
- **add-file-upload** — Add a file-upload field — drag-and-drop / click-to-pick with image thumbnails, single or multiple, backed by a swappable storage seam (zero-config browser data-URL by default; swap in S3 / disk). Use for avatars, attachments, document uploads. → `references/add-file-upload.md`
- **add-inline-edit** — Add inline / editable table cells — click a cell to edit it in place (input or select), commit on blur/Enter, revert on Escape. Use for quick spreadsheet-style edits without a separate form. → `references/add-inline-edit.md`

### Lists & tables

- **add-card-list** — Render a resource as a responsive card gallery instead of (or beside) a table, reusing the same search/filter/paginate plumbing. Use for galleries, people, products-as-cards, blog posts. → `references/add-card-list.md`
- **add-list-view** — Add a dense / compact LIST view (not a table) — rows with a leading avatar/icon, a primary + secondary line, and trailing meta. Use for people, activity, notifications, or any collection that reads better as a list than a grid. Supports a lazy-loaded variant. → `references/add-list-view.md`
- **add-infinite-list** — Add an infinite / load-more list — items load in pages via a "Load more" button and/or scroll-near-bottom, instead of numbered pagination. Use for feeds and long collections where a pager is awkward. → `references/add-infinite-list.md`
- **add-virtual-table** — Add a virtualized / windowed table that stays smooth with thousands of rows by rendering only the visible slice. Use when a list/table can hold 1000s of rows client-side. → `references/add-virtual-table.md`
- **add-table-columns** — Add column visibility + row density controls to a table — a "Columns" popover that toggles which columns show (TanStack `columnVisibility`) and switches comfortable/compact density. Use when a table has many columns or users want to declutter it. → `references/add-table-columns.md`
- **add-bulk-actions** — Add multi-row selection + a contextual action bar that applies one operation to the whole selection (bulk status change, bulk delete, export selected). Built on `DataTable`'s opt-in `enableRowSelection` / `selectionActions`. Use when users act on many rows at once. → `references/add-bulk-actions.md`
- **add-filter-panel** — Add an advanced filter / search panel — multiple controls (text, select, checkbox groups) that compose into a ListParams `{ search, filters }` object driving a list. Use when simple toolbar filters aren't enough. → `references/add-filter-panel.md`
- **add-saved-views** — Add named filter/sort presets ("saved views") to a list — save the current {search, filters, sort} under a name and re-apply or delete it later, persisted to localStorage. Use when users repeat the same filter/sort combinations. → `references/add-saved-views.md`
- **add-export-import** — Add CSV export + import to a list — download rows as an RFC 4180 CSV, and import a CSV file into a parsed preview (ready to hand to a bulk-create). Use when users need to get data out of, or bulk-load data into, a resource. → `references/add-export-import.md`

### Rich views

- **add-kanban** — Add a kanban board — records grouped into status columns with drag-and-drop between them. Use for triage/pipeline views (tasks, deals, tickets) where status is the primary axis. → `references/add-kanban.md`
- **add-calendar** — Add a calendar / month-grid view that places records on their dates. Use for scheduling, bookings, events, or any date-anchored collection. → `references/add-calendar.md`
- **add-tree-view** — Add an expandable tree / nested list — hierarchical rows with expand/collapse and indentation. Use for folders, org charts, categories, or any parent/child hierarchy. → `references/add-tree-view.md`
- **add-timeline** — Add a timeline / activity feed — chronological events on a vertical line, grouped by day. Use for audit logs, history, notifications, or any "what happened when" view. → `references/add-timeline.md`
- **add-master-detail** — Turn a resource's list into a master-detail view — the list stays mounted on the left and a record detail opens in a side panel on the right via a nested route, with selection in the URL. Use for triage/inbox-style screens. → `references/add-master-detail.md`

### Detail & pages

- **add-detail-page** — Add a Detail/Show page for a resource at /<resource>/$id — loads one record, shows a DescriptionList of fields, with breadcrumb + edit/delete. Use when the user wants to view/drill into a single record. → `references/add-detail-page.md`
- **add-record-tabs** — Add a record detail with tabs (Overview / Activity / Settings …) where the active tab is synced to the URL. Use when one record has several distinct sub-views. → `references/add-record-tabs.md`
- **add-related-records** — Show a parent record with its one-to-many child resources inline — a titled, compact related-records table (column config, "View all" link, per-row action, empty state). Use on a detail page that lists a record's children (a customer's orders + invoices). → `references/add-related-records.md`
- **add-page-layout** — Add a multi-column page layout — e.g. a main content column plus a right aside (summary/metadata), responsive down to one column. Use when a page needs primary content beside contextual side content. → `references/add-page-layout.md`
- **add-settings-page** — Add a settings / control page — grouped switches, selects, and inputs with a sticky "Save changes" bar that appears when the form is dirty. Also covers a profile/account page. Use for app/user settings. → `references/add-settings-page.md`
- **add-chart-page** — Build a dashboard/analytics view from datasets using the reusable chart components (StatCard, ChartCard, AreaChart, BarChart, PieChart). Use for overview/metrics screens. → `references/add-chart-page.md`

### Display & feedback

- **add-data-display** — Add data-display building blocks — tag list, key/value metadata panel, user (avatar+name) cell, and metric/progress tiles. Use to present record fields and small metrics consistently. → `references/add-data-display.md`
- **add-empty-state** — Add a polished empty state — centred icon, headline, description, and primary/secondary CTAs — for first-run, no-data, and filtered-no-results cases. Use so blank screens guide the user instead of looking broken. → `references/add-empty-state.md`
- **add-feedback-states** — Add feedback & overlay shapes — a side drawer (sheet), the loading/empty/error state kit, and inline banners. Use to give pages consistent loading/empty/error handling and slide-over panels. → `references/add-feedback-states.md`
- **add-notifications** — Add an in-app notification center — a header bell with an unread-count badge that opens a popover feed (icon + title + body + relative time + read/unread), with mark-one and mark-all-read. Use for activity alerts, mentions, system events. → `references/add-notifications.md`
- **add-audit-log** — Add an activity / audit trail — a vertical timeline of who did what to which record, when, with an optional field-level before→after diff. Use for history tabs, compliance trails, "recent activity" panels. → `references/add-audit-log.md`

### Platform features

- **add-rbac** — Add roles & permissions (authorization) on top of the template's authentication — a Role/Permission matrix, a server-side requireRole guard, and a RoleGate component for gating UI. Use when different users must see/do different things. Ships copy-ready code. → `references/add-rbac.md`
- **add-auth-method** — Add extra sign-in methods on top of email/password — social OAuth (GitHub/Google) and a passwordless magic link — via better-auth. Ships a drop-in SocialButtons component and a demo catalogue. Use when login needs more than a password. → `references/add-auth-method.md`
- **add-global-search** — Add a ⌘K-style global search across resources — a cmdk dialog/command that takes SearchSources (label + items + toResult, or a custom search(query)), groups hits by resource, is keyboard-navigable, and navigates to a result's href on select. Use for cross-resource jump-to. → `references/add-global-search.md`
- **add-i18n** — Add a lightweight, dependency-free internationalization seam — a Locale type, per-locale dictionaries, an I18nProvider, and useTranslation() returning t(key, vars) with {var} interpolation and locale/setLocale. Use to translate UI strings across locales. → `references/add-i18n.md`
- **add-billing** — Add a subscription / billing page — current-plan card with a usage meter, a Free/Pro/Enterprise plan picker with feature lists and a current/upgrade CTA, a payment-method row, and an invoices table (date / amount / status / download). Provider-agnostic layout; back it with Stripe. → `references/add-billing.md`
- **add-realtime** — Make lists and metrics live — auto-refresh on an interval via `refetchInterval` (or the `useLiveQuery` wrapper), with a pause control, an "updated Ns ago" indicator, and an SSE/websocket upgrade path. Use for dashboards, activity feeds, monitoring. → `references/add-realtime.md`

## Invariants

- The source of truth is the repo code; `templates/*` are generated copies kept in
  sync by `sync-skills`. Never hand-edit `templates/*`.
- Each reference's own invariants still apply — read it before copying.
