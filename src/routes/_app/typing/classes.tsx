import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ClassFormDialog } from "@/features/classes/ClassFormDialog";
import { createClassesColumns } from "@/features/classes/columns";
import { classesFilters, classesTableConfig } from "@/features/classes/config";
import { classesListQuery, useDeleteClass } from "@/features/classes/queries";
import {
  type ClassGroup,
  classListParamsSchema,
} from "@/features/classes/schema";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/typing/classes")({
  validateSearch: classListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(classesListQuery(deps)),
  component: ClassesPage,
});

type DialogState = { mode: "create" | "edit"; group?: ClassGroup } | null;

function ClassesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...classesListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteClass = useDeleteClass();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createClassesColumns({
        onEdit: (group) => setDialog({ mode: "edit", group }),
        onDelete: async (group) => {
          const ok = await confirm({
            title: `Delete “${group.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteClass.mutate(group.id);
        },
      }),
    [deleteClass, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Classes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Class groups, their teachers, and sizes.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={classesTableConfig.searchPlaceholder}
        filters={classesFilters}
        filterValues={{ level: search.level }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={classesTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={classesTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add class
          </Button>
        }
      />

      <ClassFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        group={dialog?.group}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
