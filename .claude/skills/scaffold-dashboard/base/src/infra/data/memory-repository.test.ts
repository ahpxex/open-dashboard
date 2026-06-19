import { beforeEach, describe, expect, it } from "vitest";
import { memoryRepository } from "./memory-repository";

interface Item extends Record<string, unknown> {
  id: string;
  name: string;
  status: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const seed: Item[] = [
  {
    id: "1",
    name: "Alpha",
    status: "active",
    price: 30,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "2",
    name: "Bravo",
    status: "archived",
    price: 10,
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
  {
    id: "3",
    name: "Charlie",
    status: "active",
    price: 20,
    createdAt: new Date("2026-01-03"),
    updatedAt: new Date("2026-01-03"),
  },
];

let repo: ReturnType<typeof makeRepo>;
function makeRepo() {
  return memoryRepository<Item, Omit<Item, "id" | "createdAt" | "updatedAt">>(
    seed,
    {
      searchFields: ["name"],
      sortFields: ["name", "price", "createdAt"],
      filterFields: ["status"],
      defaultSort: { field: "createdAt", dir: "desc" },
      updatedAtKey: "updatedAt",
      createdAtKey: "createdAt",
    },
  );
}

beforeEach(() => {
  repo = makeRepo();
});

describe("memoryRepository.list", () => {
  it("paginates and reports the unfiltered-by-page total", async () => {
    const { rows, total } = await repo.list({ page: 1, pageSize: 2 });
    expect(total).toBe(3);
    expect(rows).toHaveLength(2);
  });

  it("defaults to createdAt desc", async () => {
    const { rows } = await repo.list({ page: 1, pageSize: 10 });
    expect(rows.map((r) => r.id)).toEqual(["3", "2", "1"]);
  });

  it("sorts by a whitelisted field, asc and desc", async () => {
    const asc = await repo.list({
      page: 1,
      pageSize: 10,
      sortBy: "price",
      sortDir: "asc",
    });
    expect(asc.rows.map((r) => r.price)).toEqual([10, 20, 30]);

    const desc = await repo.list({
      page: 1,
      pageSize: 10,
      sortBy: "price",
      sortDir: "desc",
    });
    expect(desc.rows.map((r) => r.price)).toEqual([30, 20, 10]);
  });

  it("ignores a non-whitelisted sort field (falls back to default)", async () => {
    const { rows } = await repo.list({
      page: 1,
      pageSize: 10,
      sortBy: "status",
    });
    expect(rows.map((r) => r.id)).toEqual(["3", "2", "1"]);
  });

  it("searches case-insensitively across search fields", async () => {
    const { rows, total } = await repo.list({
      page: 1,
      pageSize: 10,
      search: "brav",
    });
    expect(total).toBe(1);
    expect(rows[0]?.name).toBe("Bravo");
  });

  it("filters by an equality field", async () => {
    const { rows, total } = await repo.list({
      page: 1,
      pageSize: 10,
      filters: { status: "active" },
    });
    expect(total).toBe(2);
    expect(rows.every((r) => r.status === "active")).toBe(true);
  });
});

describe("memoryRepository getOne/create/update/remove", () => {
  it("getOne returns the row or null", async () => {
    expect((await repo.getOne("2"))?.name).toBe("Bravo");
    expect(await repo.getOne("nope")).toBeNull();
  });

  it("create assigns an id + timestamps and is immediately listable", async () => {
    const created = await repo.create({
      name: "Delta",
      status: "active",
      price: 5,
    });
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);

    const { total } = await repo.list({ page: 1, pageSize: 10 });
    expect(total).toBe(4);
    expect(await repo.getOne(created.id)).not.toBeNull();
  });

  it("update merges fields and bumps updatedAt", async () => {
    const before = await repo.getOne("1");
    const updated = await repo.update("1", { price: 99 });
    expect(updated.price).toBe(99);
    expect(updated.name).toBe("Alpha"); // untouched fields preserved
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      before?.updatedAt.getTime() ?? 0,
    );
  });

  it("update throws for a missing record", async () => {
    await expect(repo.update("nope", { price: 1 })).rejects.toThrow();
  });

  it("remove deletes the row", async () => {
    await repo.remove("1");
    expect(await repo.getOne("1")).toBeNull();
    const { total } = await repo.list({ page: 1, pageSize: 10 });
    expect(total).toBe(2);
  });
});
