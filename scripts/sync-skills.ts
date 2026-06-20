/**
 * sync-skills — generate each skill's bundled `templates/` from the live repo
 * source files (the single source of truth), so distributed skills always carry
 * code that the repo has typechecked/built/tested.
 *
 *   bun run sync-skills           # copy repo sources -> .claude/skills/<skill>/templates/
 *   bun run sync-skills --check   # fail (exit 1) if any bundle drifts from its source
 *
 * One-way only (repo -> skills). NEVER hand-edit a file under templates/ — edit
 * the repo source and re-run. The repo's gallery/feature files double as the live
 * test for every bundled template.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const skillsDir = join(root, ".claude/skills");

/**
 * The UI-shape components folded into the single `add-component` catalogue skill.
 * Each entry maps a component name -> the repo source file(s) copied (basename
 * only) into the shared `add-component/templates/`. Grouped to match the catalogue
 * in `add-component/SKILL.md`. The per-component reference docs
 * (`add-component/references/<name>.md`) are hand-authored prose, not generated.
 */
const COMPONENT_SOURCES: Record<string, string[]> = {
  // Forms
  "add-form": [
    "src/routes/_app/gallery/form-page.tsx",
    "src/routes/_app/gallery/form-scroll.tsx",
    "src/routes/_app/gallery/form-fixed.tsx",
    "src/routes/_app/gallery/form-array.tsx",
    "src/routes/_app/gallery/form-actions.tsx",
  ],
  "add-wizard-form": ["src/routes/_app/gallery/form-wizard.tsx"],
  "add-field-combobox": [
    "src/routes/_app/gallery/form-combobox.tsx",
    "src/components/form/ComboboxField.tsx",
  ],
  "add-file-upload": [
    "src/routes/_app/gallery/file-upload.tsx",
    "src/components/form/FileField.tsx",
    "src/infra/storage/storage.ts",
  ],
  "add-inline-edit": ["src/routes/_app/gallery/table-inline-edit.tsx"],
  // Lists & tables
  "add-card-list": ["src/routes/_app/posts.tsx"],
  "add-list-view": [
    "src/routes/_app/gallery/list-lite.tsx",
    "src/routes/_app/gallery/list-lazy.tsx",
  ],
  "add-infinite-list": ["src/routes/_app/gallery/list-infinite.tsx"],
  "add-virtual-table": ["src/routes/_app/gallery/table-virtual.tsx"],
  "add-table-columns": [
    "src/routes/_app/gallery/table-columns.tsx",
    "src/infra/table/ColumnControls.tsx",
  ],
  "add-filter-panel": ["src/routes/_app/gallery/filter-panel.tsx"],
  "add-saved-views": [
    "src/routes/_app/gallery/saved-views.tsx",
    "src/infra/table/SavedViews.tsx",
  ],
  "add-export-import": [
    "src/routes/_app/gallery/export-import.tsx",
    "src/infra/data/csv.ts",
  ],
  // Rich views
  "add-kanban": ["src/routes/_app/gallery/kanban.tsx"],
  "add-calendar": ["src/routes/_app/gallery/calendar.tsx"],
  "add-tree-view": ["src/routes/_app/gallery/tree.tsx"],
  "add-timeline": ["src/routes/_app/gallery/timeline.tsx"],
  "add-master-detail": [
    "src/routes/_app/orders.tsx",
    "src/routes/_app/orders.$id.tsx",
  ],
  // Detail & pages
  "add-detail-page": ["src/routes/_app/products_.$id.tsx"],
  "add-record-tabs": ["src/routes/_app/gallery/record-tabs.tsx"],
  "add-related-records": [
    "src/routes/_app/gallery/related-records.tsx",
    "src/components/data/RelatedList.tsx",
  ],
  "add-page-layout": ["src/routes/_app/gallery/split-layout.tsx"],
  "add-settings-page": [
    "src/routes/_app/gallery/control-page.tsx",
    "src/routes/_app/gallery/profile.tsx",
  ],
  "add-chart-page": ["src/routes/_app/index.tsx"],
  // Display & feedback
  "add-data-display": [
    "src/routes/_app/gallery/data-display.tsx",
    "src/components/data/TagList.tsx",
    "src/components/data/MetadataList.tsx",
    "src/components/data/ProgressTile.tsx",
    "src/components/data/UserCell.tsx",
  ],
  "add-empty-state": ["src/routes/_app/gallery/empty-state.tsx"],
  "add-feedback-states": [
    "src/routes/_app/gallery/feedback.tsx",
    "src/components/feedback/StateView.tsx",
  ],
  "add-notifications": [
    "src/routes/_app/gallery/notifications.tsx",
    "src/components/NotificationCenter.tsx",
  ],
  "add-audit-log": [
    "src/routes/_app/gallery/audit-log.tsx",
    "src/components/data/AuditTrail.tsx",
  ],
  // Platform features
  "add-rbac": [
    "src/routes/_app/gallery/rbac.tsx",
    "src/lib/rbac.ts",
    "src/components/RoleGate.tsx",
  ],
  "add-auth-method": [
    "src/routes/_app/gallery/auth-methods.tsx",
    "src/components/auth/SocialButtons.tsx",
  ],
  "add-global-search": [
    "src/routes/_app/gallery/global-search.tsx",
    "src/components/GlobalSearch.tsx",
  ],
  "add-i18n": ["src/routes/_app/gallery/localization.tsx", "src/lib/i18n.tsx"],
  "add-billing": [
    "src/routes/_app/gallery/billing.tsx",
    "src/components/billing/PlanCard.tsx",
    "src/components/billing/UsageMeter.tsx",
  ],
  "add-realtime": [
    "src/routes/_app/gallery/realtime.tsx",
    "src/lib/use-live-query.ts",
  ],
};

/** skill name -> repo source files copied verbatim into that skill's templates/. */
const MANIFEST: Record<string, string[]> = {
  // The whole UI-shape catalogue ships as ONE retriever skill: all component
  // templates land in add-component/templates/ (flat, basename only).
  "add-component": Object.values(COMPONENT_SOURCES).flat(),
  // Testing scaffold (a resource test exemplar) — a standalone operation skill.
  "add-tests": ["src/features/__examples__/resource.test.ts"],
};

const check = process.argv.includes("--check");
let drift = 0;
let copied = 0;
let missing = 0;

for (const [skill, sources] of Object.entries(MANIFEST)) {
  const templatesDir = join(skillsDir, skill, "templates");
  // Templates are flat (basename only); two sources sharing a basename would
  // silently clobber each other in the bundle. Catch that here.
  const basenames = new Set<string>();
  for (const src of sources) {
    const base = basename(src);
    if (basenames.has(base)) {
      console.error(
        `  basename collision: ${base} (in ${skill}) — rename a source`,
      );
      missing++;
      continue;
    }
    basenames.add(base);
    const from = join(root, src);
    if (!existsSync(from)) {
      console.error(`  missing source: ${src} (for ${skill})`);
      missing++;
      continue;
    }
    const to = join(templatesDir, basename(src));
    const content = readFileSync(from, "utf8");

    if (check) {
      const current = existsSync(to) ? readFileSync(to, "utf8") : null;
      if (current !== content) {
        console.error(`  drift: ${skill}/templates/${basename(src)} != ${src}`);
        drift++;
      }
    } else {
      mkdirSync(templatesDir, { recursive: true });
      writeFileSync(to, content);
      copied++;
    }
  }
}

if (check) {
  if (drift || missing) {
    console.error(
      `\n${drift} drifted, ${missing} missing — run \`bun run sync-skills\`.`,
    );
    process.exit(1);
  }
  console.log("skills in sync with repo sources.");
} else {
  console.log(
    `synced ${copied} template(s)${missing ? `, ${missing} missing source(s)` : ""}.`,
  );
  if (missing) process.exit(1);
}
