import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  FormError,
  NumberField,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/db/schema";
import { createProductsColumns } from "@/features/products/columns";
import {
  productsFilters,
  productsTableConfig,
} from "@/features/products/config";
import {
  productsListQuery,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/features/products/queries";
import {
  type ProductInput,
  type ProductListParams,
  productFormSchema,
  productInputSchema,
  productStatuses,
} from "@/features/products/schema";
import { DataTable } from "@/infra/table";
import { errorMessage } from "@/lib/toast";

const DEFAULT_PARAMS: ProductListParams = {
  page: 1,
  pageSize: productsTableConfig.defaultPageSize,
  search: "",
  status: "",
  sortBy: undefined,
  sortDir: undefined,
};

export const Route = createFileRoute("/_app/products")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productsListQuery(DEFAULT_PARAMS)),
  component: ProductsPage,
});

type DialogState = { mode: "create" | "edit"; product?: Product } | null;

function ProductsPage() {
  const [page, setPage] = useState(DEFAULT_PARAMS.page);
  const [pageSize, setPageSize] = useState(DEFAULT_PARAMS.pageSize);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialog, setDialog] = useState<DialogState>(null);

  const params: ProductListParams = {
    page,
    pageSize,
    search,
    status,
    sortBy: sorting[0]?.id,
    sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
  };

  const query = useQuery({
    ...productsListQuery(params),
    placeholderData: keepPreviousData,
  });

  const deleteProduct = useDeleteProduct();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createProductsColumns({
        onEdit: (product) => setDialog({ mode: "edit", product }),
        onDelete: async (product) => {
          const ok = await confirm({
            title: `Delete “${product.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteProduct.mutate(product.id);
        },
      }),
    [deleteProduct, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            A full CRUD resource backed by Postgres — copy this folder to build
            your own.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={productsTableConfig.searchPlaceholder}
        filters={productsFilters}
        filterValues={{ status }}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setStatus(value);
            setPage(1);
          }
        }}
        onRefresh={() => query.refetch()}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting(updater);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={productsTableConfig.pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage={productsTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add product
          </Button>
        }
      />

      <ProductFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        product={dialog?.product}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}

const EMPTY_FORM: ProductInput = {
  name: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  status: "available",
  description: "",
};

const statusOptions = productStatuses.map((value) => ({
  value,
  label: value.replace(/_/g, " "),
}));

function toForm(product?: Product): ProductInput {
  if (!product) return { ...EMPTY_FORM };
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: product.price,
    stock: product.stock,
    status: product.status as ProductInput["status"],
    description: product.description ?? "",
  };
}

function ProductFormDialog({
  open,
  mode,
  product,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  product?: Product;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit product" : "New product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the product details below."
              : "Add a new product to your catalogue."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ProductForm
            key={product?.id ?? "new"}
            mode={mode}
            product={product}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  mode,
  product,
  onDone,
}: {
  mode: "create" | "edit";
  product?: Product;
  onDone: () => void;
}) {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(product),
    validators: { onChange: productFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = productInputSchema.parse(value);
      try {
        if (mode === "edit" && product) {
          await update.mutateAsync({ id: product.id, ...payload });
        } else {
          await create.mutateAsync(payload);
        }
        onDone();
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={serverError} />

      <TextField form={form} name="name" label="Name" required />

      <div className="grid grid-cols-2 gap-3">
        <TextField form={form} name="sku" label="SKU" required />
        <TextField form={form} name="category" label="Category" required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NumberField
          form={form}
          name="price"
          label="Price"
          min={0}
          step="0.01"
          required
        />
        <NumberField form={form} name="stock" label="Stock" min={0} required />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
      </div>

      <TextareaField
        form={form}
        name="description"
        label="Description"
        rows={3}
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
