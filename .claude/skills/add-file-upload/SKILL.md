---
name: add-file-upload
description: Add a file-upload field — drag-and-drop / click-to-pick with image thumbnails, single or multiple, backed by a swappable storage seam (zero-config browser data-URL by default; swap in S3 / disk). Use for avatars, attachments, document uploads. Ships a copy-ready template.
---

# Add a file upload

A drag-and-drop / click-to-pick upload control plus a **storage seam** — the
upload counterpart to the `Repository` data adapter. The control (`FileUpload`
standalone, `FileField` form-bound), the `StorageAdapter` interface + the
zero-config `dataUrlStorage`, and a showcase page are **bundled** under
`templates/` — copy, don't paste.

## Add it

```bash
cp .claude/skills/add-file-upload/templates/storage.ts src/infra/storage/storage.ts
cp .claude/skills/add-file-upload/templates/FileField.tsx src/components/form/FileField.tsx
# Optional: a gallery page showcasing avatar + multi-file upload
cp .claude/skills/add-file-upload/templates/file-upload.tsx src/routes/_app/<name>.tsx
```

Then:
1. **Standalone**: render `<FileUpload value={files} onChange={setFiles} />` —
   controlled over `StoredFile[]`. Props: `multiple`, `accept`, `avatar`
   (square tile), `hint`, `storage`.
2. **In a form**: render `<FileField form={form} name="avatar" label="Avatar" />`
   — it stores a `StoredFile[]` on the field (model the field as
   `z.array(...)`). Works alongside `TextField`/`SelectField`.
3. If you copied the showcase page, set its `createFileRoute("/_app/<name>")`
   path to match the file path.

(Only open a template if you need to customise it — copying it costs no context.)

## The storage seam

`StorageAdapter` is `{ upload(file: File): Promise<{ url, name, size }> }`. The
default `dataUrlStorage` reads the file to a `data:` URL in the browser — **zero
config, no backend** (good for demos and small files). For real storage, write
an adapter that uploads via a **server fn** (`requireUser()` + type/size
validation + the bucket/disk write, secrets server-side) and returns the URL,
then pass it as `storage={bucketStorage}`. The control never changes — mirrors
how a resource swaps `drizzleRepository` for `restRepository` in `server.ts`.

**Error contract**: the adapter *rejects*, the control *reports*. On a failed
`upload(...)` (network / validation / auth on a real backend, or a failed read)
`FileUpload` clears the busy spinner and shows a destructive toast by default;
pass `onError={(err) => …}` (on `FileUpload` or `FileField`) to route it through
`FormError` or your own handling instead.

## Foundation it assumes

`@/components/form` (`FormField`), `@/components/ui/card` (showcase page),
`@/lib/{toast,utils}`, `@phosphor-icons/react`, the page-shell heading, and
theme tokens — all provided by the base (see the `scaffold-dashboard` skill).

## Invariants

- The control is fully controlled over `StoredFile[]`; storage is reached only
  through the `StorageAdapter` interface. Theme tokens only.
- Real uploads go through a server fn (`requireUser()` + validation); the
  adapter's browser half stays the same.
- A rejected upload is surfaced (toast by default, or `onError`) — never
  silently swallowed.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — drop an image and
confirm the thumbnail + returned URL render.
