import type { FilterConfig } from "@/infra/table";

export const ticketsFilters: FilterConfig[] = [
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "open", label: "Open" },
      { key: "pending", label: "Pending" },
      { key: "resolved", label: "Resolved" },
      { key: "closed", label: "Closed" },
    ],
  },
  {
    key: "priority",
    label: "Filter by priority",
    placeholder: "All priorities",
    options: [
      { key: "", label: "All priorities" },
      { key: "low", label: "Low" },
      { key: "medium", label: "Medium" },
      { key: "high", label: "High" },
      { key: "urgent", label: "Urgent" },
    ],
  },
];

export const ticketsTableConfig = {
  searchPlaceholder: "Search tickets…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No tickets found.",
};
