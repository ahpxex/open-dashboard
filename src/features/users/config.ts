import type { FilterConfig } from "@/infra/table";

export const usersFilters: FilterConfig[] = [
  {
    key: "role",
    label: "Filter by role",
    placeholder: "All roles",
    options: [
      { key: "", label: "All roles" },
      { key: "admin", label: "Admin" },
      { key: "member", label: "Member" },
      { key: "viewer", label: "Viewer" },
    ],
  },
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "active", label: "Active" },
      { key: "invited", label: "Invited" },
      { key: "suspended", label: "Suspended" },
    ],
  },
];

export const usersTableConfig = {
  searchPlaceholder: "Search users…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No users found.",
};
