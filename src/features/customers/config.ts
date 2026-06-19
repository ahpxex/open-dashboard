import type { FilterConfig } from "@/infra/table";

export const customersFilters: FilterConfig[] = [
  {
    key: "plan",
    label: "Filter by plan",
    placeholder: "All plans",
    options: [
      { key: "", label: "All plans" },
      { key: "free", label: "Free" },
      { key: "pro", label: "Pro" },
      { key: "scale", label: "Scale" },
    ],
  },
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "trial", label: "Trial" },
      { key: "active", label: "Active" },
      { key: "churned", label: "Churned" },
    ],
  },
];

export const customersTableConfig = {
  searchPlaceholder: "Search customers…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No customers found.",
};
