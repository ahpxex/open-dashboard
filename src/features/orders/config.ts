import type { FilterConfig } from "@/infra/table";

export const ordersFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "active", label: "Active" },
      { key: "archived", label: "Archived" },
    ],
  },
];

export const ordersTableConfig = {
  searchPlaceholder: "Search orders…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No orders found.",
};
