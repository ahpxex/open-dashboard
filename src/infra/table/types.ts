export type SortDir = "asc" | "desc";

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: FilterOption[];
}

/** Server-side list request parameters shared by every resource. */
export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDir;
  filters?: Record<string, string>;
}

/** Server-side list response shape. */
export interface ListResult<T> {
  rows: T[];
  total: number;
}
