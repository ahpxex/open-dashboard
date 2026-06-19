import type { FilterConfig } from "@/infra/table";

export const articlesFilters: FilterConfig[] = [
  {
    key: "difficulty",
    label: "Filter by difficulty",
    placeholder: "All levels",
    options: [
      { key: "", label: "All levels" },
      { key: "easy", label: "Easy" },
      { key: "medium", label: "Medium" },
      { key: "hard", label: "Hard" },
    ],
  },
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "draft", label: "Draft" },
      { key: "published", label: "Published" },
      { key: "archived", label: "Archived" },
    ],
  },
];

export const articlesTableConfig = {
  searchPlaceholder: "Search articles…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No articles found.",
};
