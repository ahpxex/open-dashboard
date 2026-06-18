import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FormError,
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
import type { Order } from "@/db/schema";
import { createOrdersColumns } from "@/features/orders/columns";
import { ordersFilters, ordersTableConfig } from "@/features/orders/config";
import {
  ordersListQuery,
  useCreateOrder,
  useDeleteOrder,
  useUpdateOrder,
} from "@/features/orders/queries";
import {
  type OrderInput,
  ordersFormSchema,
  ordersInputSchema,
  ordersListParamsSchema,
  ordersStatuses,
} from "@/features/orders/schema";
import { DataTable, useTableSearch } from "@/infra/table";
import { errorMessage } from "@/lib/toast";

export const Route = createFileRoute("/_app/orders")({
  validateSearch: ordersListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(ordersListQuery(deps)),
  component: OrdersPage,
});

type DialogState = { mode: "create" | "edit"; row?: Order } | null;

function OrdersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...ordersListQuery(search),
    placeholderData: keepPreviousData,
  });
  const remove = useDeleteOrder();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createOrdersColumns({
        onEdit: (row) => setDialog({ mode: "edit", row }),
        onDelete: async (row) => {
          const ok = await confirm({
            title: `Delete “${row.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) remove.mutate(row.id);
        },
      }),
    [remove, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Generated resource — customise the schema and columns to fit.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={ordersTableConfig.searchPlaceholder}
        filters={ordersFilters}
        filterValues={{ status: search.status }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={ordersTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={ordersTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add orders
          </Button>
        }
      />

      <OrderFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        row={dialog?.row}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}

const EMPTY_FORM: OrderInput = {
  name: "",
  status: "active",
  description: "",
};

const statusOptions = ordersStatuses.map((value) => ({ value, label: value }));

function toForm(row?: Order): OrderInput {
  if (!row) return { ...EMPTY_FORM };
  return {
    name: row.name,
    status: row.status as OrderInput["status"],
    description: row.description ?? "",
  };
}

function OrderFormDialog({
  open,
  mode,
  row,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  row?: Order;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit orders" : "New orders"}
          </DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>

        {open ? (
          <OrderForm
            key={row?.id ?? "new"}
            mode={mode}
            row={row}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrderForm({
  mode,
  row,
  onDone,
}: {
  mode: "create" | "edit";
  row?: Order;
  onDone: () => void;
}) {
  const create = useCreateOrder();
  const update = useUpdateOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(row),
    validators: { onChange: ordersFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = ordersInputSchema.parse(value);
      try {
        if (mode === "edit" && row) {
          await update.mutateAsync({ id: row.id, ...payload });
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

      <SelectField
        form={form}
        name="status"
        label="Status"
        options={statusOptions}
      />

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
