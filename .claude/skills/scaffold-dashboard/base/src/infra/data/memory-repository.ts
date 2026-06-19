import type { ListParams, ListResult, Repository, SortDir } from "./repository";

export interface MemoryRepositoryConfig<T> {
  /** Property used as the identifier. Defaults to `"id"`. */
  idField?: keyof T;
  /** Fields case-insensitively substring-searched when `params.search` is set. */
  searchFields?: (keyof T)[];
  /** Whitelist of sortable fields (mirrors the drizzle adapter — never sort by raw input). */
  sortFields?: (keyof T)[];
  /** Whitelist of `filters` keys mapped to equality checks. */
  filterFields?: (keyof T)[];
  /** Fallback sort when `sortBy` is missing/unknown. */
  defaultSort?: { field: keyof T; dir?: SortDir };
  /** Field stamped with `new Date()` on create + update. */
  updatedAtKey?: keyof T;
  /** Field stamped with `new Date()` on create. */
  createdAtKey?: keyof T;
  /** Id generator for `create`. Defaults to `crypto.randomUUID()`. */
  generateId?: () => string;
}

function compare(a: unknown, b: unknown): number {
  if (a == null) return b == null ? 0 : -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * In-memory implementation of {@link Repository} — the zero-config default
 * backend. State lives in a plain array for the lifetime of the server process
 * (resets on restart), which is exactly what a `bun dev` demo needs when no
 * database is configured. Same interface as `drizzleRepository`, so a resource
 * swaps between them by changing only its `server.ts` binding.
 *
 * ```ts
 * export const repo = memoryRepository<Product, NewProduct>(demoProducts, {
 *   searchFields: ["name", "sku"],
 *   sortFields: ["name", "price", "createdAt"],
 *   filterFields: ["status"],
 *   defaultSort: { field: "createdAt", dir: "desc" },
 *   updatedAtKey: "updatedAt",
 * });
 * ```
 */
export function memoryRepository<T extends Record<string, unknown>, TInput>(
  seed: T[] = [],
  config: MemoryRepositoryConfig<T> = {},
): Repository<T, TInput> {
  const idField = config.idField ?? ("id" as keyof T);
  const generateId = config.generateId ?? (() => crypto.randomUUID());
  const rows: T[] = seed.map((row) => ({ ...row }));

  const sameId = (row: T, id: string) => String(row[idField]) === String(id);

  function matches(row: T, params: ListParams): boolean {
    if (params.search && config.searchFields?.length) {
      const term = params.search.toLowerCase();
      const hit = config.searchFields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(term),
      );
      if (!hit) return false;
    }

    if (params.filters && config.filterFields?.length) {
      for (const [key, value] of Object.entries(params.filters)) {
        if (!value) continue;
        if (!config.filterFields.includes(key as keyof T)) continue;
        if (String(row[key as keyof T] ?? "") !== value) return false;
      }
    }

    return true;
  }

  return {
    async list(params) {
      const filtered = rows.filter((row) => matches(row, params));

      const sortField =
        params.sortBy && config.sortFields?.includes(params.sortBy as keyof T)
          ? (params.sortBy as keyof T)
          : config.defaultSort?.field;
      const dir: SortDir = params.sortDir ?? config.defaultSort?.dir ?? "desc";

      if (sortField) {
        const factor = dir === "asc" ? 1 : -1;
        filtered.sort((a, b) => compare(a[sortField], b[sortField]) * factor);
      }

      const offset = (params.page - 1) * params.pageSize;
      return {
        rows: filtered.slice(offset, offset + params.pageSize),
        total: filtered.length,
      } satisfies ListResult<T>;
    },

    async getOne(id) {
      return rows.find((row) => sameId(row, id)) ?? null;
    },

    async create(input) {
      const now = new Date();
      const row = { ...(input as unknown as T) };
      if (row[idField] == null) {
        (row as Record<string, unknown>)[idField as string] = generateId();
      }
      if (config.createdAtKey && row[config.createdAtKey] == null) {
        (row as Record<string, unknown>)[config.createdAtKey as string] = now;
      }
      if (config.updatedAtKey) {
        (row as Record<string, unknown>)[config.updatedAtKey as string] = now;
      }
      rows.unshift(row);
      return row;
    },

    async update(id, input) {
      const row = rows.find((r) => sameId(r, id));
      if (!row) throw new Error(`Record "${id}" not found`);
      Object.assign(row, input);
      if (config.updatedAtKey) {
        (row as Record<string, unknown>)[config.updatedAtKey as string] =
          new Date();
      }
      return row;
    },

    async remove(id) {
      const index = rows.findIndex((row) => sameId(row, id));
      if (index !== -1) rows.splice(index, 1);
    },
  };
}
