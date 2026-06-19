import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { RowSelectionState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { createUsersColumns } from "@/features/users/columns";
import { usersFilters, usersTableConfig } from "@/features/users/config";
import {
  useBulkDeleteUsers,
  useDeleteUser,
  usersListQuery,
} from "@/features/users/queries";
import type { User } from "@/features/users/schema";
import { userListParamsSchema } from "@/features/users/schema";
import { UserFormDialog } from "@/features/users/UserFormDialog";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/taoracle/users")({
  validateSearch: userListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(usersListQuery(deps)),
  component: UsersPage,
});

type DialogState = { mode: "create" | "edit"; user?: User } | null;

function UsersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const query = useQuery({
    ...usersListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteUser = useDeleteUser();
  const bulkDelete = useBulkDeleteUsers();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createUsersColumns({
        onEdit: (user) => setDialog({ mode: "edit", user }),
        onDelete: async (user) => {
          const ok = await confirm({
            title: `Delete “${user.name}”?`,
            description: "This account will be removed. This cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteUser.mutate(user.id);
        },
      }),
    [deleteUser, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage taoracle accounts — roles, status, and access.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={usersTableConfig.searchPlaceholder}
        filters={usersFilters}
        filterValues={{ role: search.role, status: search.status }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={usersTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={usersTableConfig.emptyMessage}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(user) => user.id}
        selectionActions={(ids) => (
          <Button
            variant="destructive"
            size="sm"
            disabled={bulkDelete.isPending}
            onClick={async () => {
              const ok = await confirm({
                title: `Delete ${ids.length} user${ids.length === 1 ? "" : "s"}?`,
                description: "This action cannot be undone.",
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) {
                await bulkDelete.mutateAsync(ids);
                setRowSelection({});
              }
            }}
          >
            <TrashIcon size={16} />
            Delete selected
          </Button>
        )}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add user
          </Button>
        }
      />

      <UserFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        user={dialog?.user}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
