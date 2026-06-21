import type { FilterConfig } from "@/infra/table";

export const ordersFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "pending", label: "Pending" },
      { key: "paid", label: "Paid" },
      { key: "fulfilled", label: "Fulfilled" },
      { key: "refunded", label: "Refunded" },
      { key: "cancelled", label: "Cancelled" },
    ],
  },
];

export const ordersTableConfig = {
  searchPlaceholder: "Search orders or customers…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No orders found.",
};
