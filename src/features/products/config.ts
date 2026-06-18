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
