import type { FilterConfig } from "@/infra/table";

export const companiesFilters: FilterConfig[] = [
  {
    key: "industry",
    label: "Filter by industry",
    placeholder: "All industries",
    options: [
      { key: "", label: "All industries" },
      { key: "saas", label: "SaaS" },
      { key: "fintech", label: "Fintech" },
      { key: "healthcare", label: "Healthcare" },
      { key: "ecommerce", label: "E-commerce" },
      { key: "media", label: "Media" },
      { key: "other", label: "Other" },
    ],
  },
];

export const companiesListConfig = {
  searchPlaceholder: "Search companies…",
  pageSizeOptions: [12, 24, 48],
  defaultPageSize: 12,
  emptyMessage: "No companies found.",
};
