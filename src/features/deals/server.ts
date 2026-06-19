import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoDeals } from "./demo-data";
import {
  type Deal,
  type DealInput,
  type DealListParams,
  dealInputSchema,
  dealListParamsSchema,
  dealUpdateSchema,
} from "./schema";

export const dealsRepository: Repository<Deal, DealInput> = memoryRepository<
  Deal,
  DealInput
>(demoDeals, {
  searchFields: ["name", "company", "owner"],
  sortFields: ["name", "value", "createdAt"],
  filterFields: ["stage"],
  defaultSort: { field: "createdAt", dir: "desc" },
  createdAtKey: "createdAt",
  updatedAtKey: "updatedAt",
});

function toListParams(data: DealListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.stage ? { stage: data.stage } : undefined,
  };
}

export const listDeals = createServerFn({ method: "GET" })
  .validator((data: DealListParams) => dealListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return dealsRepository.list(toListParams(data));
  });

export const createDeal = createServerFn({ method: "POST" })
  .validator((data: unknown) => dealInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return dealsRepository.create(data);
  });

export const updateDeal = createServerFn({ method: "POST" })
  .validator((data: unknown) => dealUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return dealsRepository.update(id, values);
  });

export const deleteDeal = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await dealsRepository.remove(id);
    return { id };
  });
