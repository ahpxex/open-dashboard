import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ArticleFormDialog } from "@/features/articles/ArticleFormDialog";
import { createArticlesColumns } from "@/features/articles/columns";
import {
  articlesFilters,
  articlesTableConfig,
} from "@/features/articles/config";
import {
  articlesListQuery,
  useDeleteArticle,
} from "@/features/articles/queries";
import {
  type Article,
  articleListParamsSchema,
} from "@/features/articles/schema";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/typing/articles")({
  validateSearch: articleListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(articlesListQuery(deps)),
  component: ArticlesPage,
});

type DialogState = { mode: "create" | "edit"; article?: Article } | null;

function ArticlesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...articlesListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteArticle = useDeleteArticle();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createArticlesColumns({
        onEdit: (article) => setDialog({ mode: "edit", article }),
        onDelete: async (article) => {
          const ok = await confirm({
            title: `Delete “${article.title}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteArticle.mutate(article.id);
        },
      }),
    [deleteArticle, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Articles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Typing passages students practice on.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={articlesTableConfig.searchPlaceholder}
        filters={articlesFilters}
        filterValues={{ difficulty: search.difficulty, status: search.status }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={articlesTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={articlesTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add article
          </Button>
        }
      />

      <ArticleFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        article={dialog?.article}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
