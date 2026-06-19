import type { FilterConfig } from "@/infra/table";

export const classesFilters: FilterConfig[] = [
  {
    key: "level",
    label: "Filter by level",
    placeholder: "All levels",
    options: [
      { key: "", label: "All levels" },
      { key: "beginner", label: "Beginner" },
      { key: "intermediate", label: "Intermediate" },
      { key: "advanced", label: "Advanced" },
    ],
  },
];

export const classesTableConfig = {
  searchPlaceholder: "Search classes…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No classes found.",
};
