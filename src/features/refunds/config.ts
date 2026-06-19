import type { FilterConfig } from "@/infra/table";

export const refundsFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "pending", label: "Pending" },
      { key: "approved", label: "Approved" },
      { key: "rejected", label: "Rejected" },
    ],
  },
  {
    key: "reason",
    label: "Filter by reason",
    placeholder: "All reasons",
    options: [
      { key: "", label: "All reasons" },
      { key: "duplicate", label: "Duplicate" },
      { key: "fraudulent", label: "Fraudulent" },
      { key: "requested_by_customer", label: "Requested" },
      { key: "defective", label: "Defective" },
    ],
  },
];

export const refundsTableConfig = {
  searchPlaceholder: "Search by order or customer…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No refunds found.",
};
