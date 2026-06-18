import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTableSearch } from "./useTableSearch";

interface Search {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status: string;
}

const base: Search = {
  page: 2,
  pageSize: 10,
  search: "",
  status: "",
};

/** Render the hook and return the patch a handler would write to the URL. */
function patchFrom(navigate: ReturnType<typeof vi.fn>, prev: Search): Search {
  const arg = navigate.mock.calls.at(-1)?.[0] as {
    search: (p: Search) => Search;
  };
  return arg.search(prev);
}

describe("useTableSearch", () => {
  it("derives SortingState from sortBy/sortDir", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useTableSearch({ ...base, sortBy: "name", sortDir: "desc" }, navigate),
    );
    expect(result.current.sorting).toEqual([{ id: "name", desc: true }]);
  });

  it("has empty sorting when sortBy is unset", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useTableSearch(base, navigate));
    expect(result.current.sorting).toEqual([]);
  });

  it("setPage updates the page without resetting it", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useTableSearch(base, navigate));
    result.current.setPage(5);
    expect(patchFrom(navigate, base)).toEqual({ ...base, page: 5 });
  });

  it("setSearch resets to page 1", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useTableSearch(base, navigate));
    result.current.setSearch("widget");
    expect(patchFrom(navigate, base)).toEqual({
      ...base,
      search: "widget",
      page: 1,
    });
  });

  it("setFilter writes the filter key and resets to page 1", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useTableSearch(base, navigate));
    result.current.setFilter("status", "active");
    expect(patchFrom(navigate, base)).toEqual({
      ...base,
      status: "active",
      page: 1,
    });
  });

  it("setPageSize resets to page 1", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useTableSearch(base, navigate));
    result.current.setPageSize(50);
    expect(patchFrom(navigate, base)).toEqual({
      ...base,
      pageSize: 50,
      page: 1,
    });
  });

  it("onSortingChange writes sortBy/sortDir and resets to page 1", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useTableSearch(base, navigate));
    result.current.onSortingChange([{ id: "price", desc: false }]);
    expect(patchFrom(navigate, base)).toEqual({
      ...base,
      sortBy: "price",
      sortDir: "asc",
      page: 1,
    });
  });

  it("onSortingChange clears sort when sorting is removed", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() =>
      useTableSearch({ ...base, sortBy: "price", sortDir: "asc" }, navigate),
    );
    result.current.onSortingChange([]);
    const patch = patchFrom(navigate, { ...base, sortBy: "price" });
    expect(patch.sortBy).toBeUndefined();
    expect(patch.sortDir).toBeUndefined();
    expect(patch.page).toBe(1);
  });
});
