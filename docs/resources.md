# Adding a Resource

A **resource** is a CRUD entity (products, orders, customers…) backed by a PostgreSQL table and surfaced as a server-driven data table. Every resource follows the same pattern so adding one is mostly copy-paste-and-rename.

**`products` is the canonical reference.** This guide walks through it file by file, then shows how the generic `DataTable` consumes it. To create a new resource you can either copy `src/features/products/` and adapt, or run the generator (see the end).

A resource is made of two parts:

1. A feature folder: `src/features/<name>/` — schema, server functions, query hooks, columns, config.
2. A route: `src/routes/_app/<name>.tsx` — the page that wires everything into `DataTable`.
3. (Plus) a Drizzle table in `src/db/schema.ts` and a sidebar entry in `src/lib/sidebar-items.ts`.

---

## 0. The database table — `src/db/schema.ts`

Define a Drizzle table alongside `products`:

```ts
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: doublePrecision("price").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  status: text("status").notNull().default("active"),
  sku: text("sku").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
```

Then generate and apply a migration:

```bash
bun run db:generate   # writes SQL into ./drizzle
bun run db:migrate
```

The `$inferSelect`/`$inferInsert` types flow through the rest of the resource — you rarely hand-write row types.

---

## 1. `schema.ts` — Zod schemas & types

Three schemas: the mutation **input**, the **update** (input + `id`), and the **list params** (pagination/sort/search/filter). These validate every server-function call.

```ts
import { z } from "zod";

export const productStatuses = ["available", "out_of_stock", "discontinued"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const productInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  status: z.enum(productStatuses),
  description: z.string().optional().default(""),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const productUpdateSchema = productInputSchema.extend({ id: z.string().min(1) });
export type ProductUpdate = z.infer<typeof productUpdateSchema>;

export const productListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
});
export type ProductListParams = z.infer<typeof productListParamsSchema>;
```

The list params are the shared contract between the page state, the query hook, and the server fn.

---

## 2. `server.ts` — server functions

Each operation is a `createServerFn` from `@tanstack/react-start`. The rules:

- **Authorize**: call `await requireUser()` first (from `@/lib/auth-server`). It throws `"UNAUTHORIZED"` if there's no session.
- **Validate**: pass the Zod schema to `.validator(...)` — never trust raw client input.
- **Query**: use Drizzle (`db` from `@/db`).
- **Sort safely**: resolve `sortBy` against a **whitelist** of columns; default to `createdAt`. Never sort by raw user input.
- **Return shape**: the list returns `{ rows, total }` (where `total` comes from `count()`), enabling server-side pagination.

```ts
import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireUser } from "@/lib/auth-server";
import { productInputSchema, productListParamsSchema, productUpdateSchema } from "./schema";

const sortableColumns = {
  name: products.name,
  category: products.category,
  price: products.price,
  stock: products.stock,
  createdAt: products.createdAt,
} as const;

export const listProducts = createServerFn({ method: "GET" })
  .validator((data) => productListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();

    const conditions: SQL[] = [];
    if (data.search) {
      const term = `%${data.search}%`;
      const matcher = or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.category, term),
      );
      if (matcher) conditions.push(matcher);
    }
    if (data.status) conditions.push(eq(products.status, data.status));
    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn =
      sortableColumns[data.sortBy as keyof typeof sortableColumns] ?? products.createdAt;
    const orderBy = data.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (data.page - 1) * data.pageSize;

    const [rows, totalResult] = await Promise.all([
      db.select().from(products).where(where).orderBy(orderBy).limit(data.pageSize).offset(offset),
      db.select({ value: count() }).from(products).where(where),
    ]);

    return { rows, total: totalResult[0]?.value ?? 0 };
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const [row] = await db.insert(products).values(data).returning();
    return row;
  });

// getProduct, updateProduct, deleteProduct follow the same shape.
```

`updateProduct` sets `updatedAt: new Date()`; `deleteProduct` validates the id with `z.string().min(1)` and returns `{ id }`.

---

## 3. `queries.ts` — TanStack Query hooks

The bridge between server functions and React. Provide a **key factory**, a **list query** (as `queryOptions`, so it works both in route loaders and components), and **mutation hooks** that invalidate the resource's keys on success.

```ts
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductInput, ProductListParams, ProductUpdate } from "./schema";
import { createProduct, deleteProduct, listProducts, updateProduct } from "./server";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
};

export function productsListQuery(params: ProductListParams) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts({ data: params }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
// useUpdateProduct / useDeleteProduct are identical in shape.
```

Note how a server function is **called directly** — `listProducts({ data: params })` — there's no fetch or REST layer to write.

---

## 4. `columns.tsx` — table columns

A factory returning TanStack Table `ColumnDef[]`. It takes a context with row callbacks (`onEdit`, `onDelete`) so the page can open dialogs / confirm deletes. Use the shared cells from `@/infra/ui` (`StatusChip`, `ActionMenu`) for consistency.

```tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/db/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { ProductStatus } from "./schema";

export interface ProductsTableContext {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function createProductsColumns(context: ProductsTableContext): ColumnDef<Product>[] {
  return [
    { accessorKey: "name", header: "Name", cell: (info) => <span className="font-medium">{info.getValue() as string}</span> },
    { accessorKey: "status", header: "Status", enableSorting: false, cell: (info) => (
      <StatusChip status={info.getValue() as ProductStatus} colorMap={statusColorMap} labelMap={statusLabelMap} />
    ) },
    { id: "actions", header: "", enableSorting: false, cell: (info) => (
      <ActionMenu onEdit={() => context.onEdit(info.row.original)} onDelete={() => context.onDelete(info.row.original)} />
    ) },
    // …other columns
  ];
}
```

Set `enableSorting: false` on columns that aren't in the server's sortable whitelist (the toggle only appears on sortable headers).

---

## 5. `config.ts` — filters & table options

Static UI config: the filter dropdowns (matching the server's filterable fields) and table presentation options.

```ts
import type { FilterConfig } from "@/infra/table";

export const productsFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "available", label: "Available" },
      { key: "out_of_stock", label: "Out of Stock" },
      { key: "discontinued", label: "Discontinued" },
    ],
  },
];

export const productsTableConfig = {
  searchPlaceholder: "Search products…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No products found.",
};
```

---

## 6. The route — `src/routes/_app/<name>.tsx`

The page lives under `_app/`, so it's automatically **auth-guarded** (the `_app` layout redirects to `/login` if there's no session). It:

1. Prefetches the first page in the route `loader` via `context.queryClient.ensureQueryData(...)`.
2. Owns all table state (`page`, `pageSize`, `search`, filter values, `sorting`) in `useState`.
3. Reads data with `useQuery(productsListQuery(params))` (plus `keepPreviousData` to avoid flicker on page changes).
4. Renders `DataTable`, passing state down and lifting changes back up (each change resets `page` to 1 where appropriate).

```tsx
export const Route = createFileRoute("/_app/products")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productsListQuery(DEFAULT_PARAMS)),
  component: ProductsPage,
});

function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const params: ProductListParams = {
    page, pageSize, search, status,
    sortBy: sorting[0]?.id,
    sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
  };

  const query = useQuery({ ...productsListQuery(params), placeholderData: keepPreviousData });
  const deleteProduct = useDeleteProduct();

  const columns = useMemo(
    () => createProductsColumns({
      onEdit: (product) => setDialog({ mode: "edit", product }),
      onDelete: (product) => deleteProduct.mutate(product.id),
    }),
    [deleteProduct],
  );

  return (
    <DataTable
      columns={columns}
      data={query.data?.rows ?? []}
      total={query.data?.total ?? 0}
      isLoading={query.isLoading || query.isFetching}
      searchValue={search}
      onSearchChange={(v) => { setSearch(v); setPage(1); }}
      filters={productsFilters}
      filterValues={{ status }}
      onFilterChange={(key, v) => { if (key === "status") { setStatus(v); setPage(1); } }}
      sorting={sorting}
      onSortingChange={(updater) => { setSorting(updater); setPage(1); }}
      page={page}
      pageSize={pageSize}
      pageSizeOptions={productsTableConfig.pageSizeOptions}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage={productsTableConfig.emptyMessage}
      toolbarActions={<Button onClick={() => setDialog({ mode: "create" })}>Add product</Button>}
    />
  );
}
```

Create/edit is handled by a `Dialog` (shadcn/ui, built on `@base-ui/react`) using `useCreateProduct()` / `useUpdateProduct()` and a Zod-typed form. See the full file at `src/routes/_app/products.tsx`.

---

## 7. The sidebar — `src/lib/sidebar-items.ts`

Add a navigation entry to `mainMenuItems`. There's a `// create-resource:anchor` line marking where the generator inserts items:

```ts
export const mainMenuItems: MenuGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: HouseIcon },
      { label: "Products", href: "/products", icon: PackageIcon },
      // create-resource:anchor (keep this line — generated resources are inserted above)
    ],
  },
  // …
];
```

---

## How `DataTable` consumes a resource

`src/infra/table/DataTable.tsx` is a generic, **fully-controlled, server-driven** table (`DataTable<T>`). It does not fetch, paginate, or sort on its own — the page does (server-side). Key points:

- It enables `manualPagination`, `manualSorting`, and `manualFiltering` on the underlying TanStack Table, so all heavy lifting happens in your server function.
- Props are the controlled state: `data`, `total`, `page`, `pageSize`, `sorting`, `searchValue`, `filterValues`, plus `on*Change` callbacks.
- It composes `TableToolbar` (search + filters + refresh) and `TablePaginationControls`, computing `totalPages` from `total / pageSize`.
- Sortable headers (those without `enableSorting: false`) render a sort toggle; clicking calls `onSortingChange`.

Because the contract is uniform (`{ rows, total }` + `ListParams`-shaped state), every resource reuses the exact same table component.

---

## Shortcut: the generator

Instead of copying by hand, scaffold a resource with:

```bash
bun run create-resource <name>   # plural, e.g. orders
```

`scripts/create-resource.ts` scaffolds a full CRUD resource modelled on `products`:

- `src/features/<name>/{schema,server,queries,columns,config}` — the full feature folder.
- `src/routes/_app/<name>.tsx` — the wired-up page.
- A Drizzle table **appended to `src/db/schema.ts`**.
- A sidebar entry inserted at the `// create-resource:anchor` line in `src/lib/sidebar-items.ts`.

After generating:

1. Customise the fields in `src/db/schema.ts` and `src/features/<name>/` to match your domain.
2. Run `bun run db:generate && bun run db:migrate`.
3. Visit `/<name>`.
