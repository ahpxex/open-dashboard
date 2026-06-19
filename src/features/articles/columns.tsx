import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { Article, ArticleDifficulty, ArticleStatus } from "./schema";

export const difficultyColorMap: Record<ArticleDifficulty, ChipColor> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

export const articleStatusColorMap: Record<ArticleStatus, ChipColor> = {
  draft: "default",
  published: "success",
  archived: "secondary",
};

export interface ArticlesTableContext {
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export function createArticlesColumns(
  context: ArticlesTableContext,
): ColumnDef<Article>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      enableSorting: false,
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "wordCount",
      header: "Words",
      cell: (info) => (
        <span className="tabular-nums">
          {(info.getValue() as number).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as ArticleDifficulty}
          colorMap={difficultyColorMap}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as ArticleStatus}
          colorMap={articleStatusColorMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const article = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(article)}
              onDelete={() => context.onDelete(article)}
            />
          </div>
        );
      },
    },
  ];
}
