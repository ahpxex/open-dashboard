import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoRedemptionCodes } from "./demo-data";
import {
  type NewRedemptionCode,
  type RedemptionCode,
  type RedemptionCodeListParams,
  redemptionCodeInputSchema,
  redemptionCodeListParamsSchema,
  redemptionCodeUpdateSchema,
} from "./schema";

export const redemptionCodesRepository: Repository<
  RedemptionCode,
  NewRedemptionCode
> = memoryRepository<RedemptionCode, NewRedemptionCode>(demoRedemptionCodes, {
  searchFields: ["code"],
  sortFields: ["code", "discountPercent", "usedCount", "createdAt"],
  filterFields: ["status"],
  defaultSort: { field: "createdAt", dir: "desc" },
  createdAtKey: "createdAt",
  updatedAtKey: "updatedAt",
});

function toListParams(data: RedemptionCodeListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.status ? { status: data.status } : undefined,
  };
}

export const listRedemptionCodes = createServerFn({ method: "GET" })
  .validator((data: RedemptionCodeListParams) =>
    redemptionCodeListParamsSchema.parse(data),
  )
  .handler(async ({ data }) => {
    await requireUser();
    return redemptionCodesRepository.list(toListParams(data));
  });

export const createRedemptionCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => redemptionCodeInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return redemptionCodesRepository.create({ ...data, usedCount: 0 });
  });

export const updateRedemptionCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => redemptionCodeUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return redemptionCodesRepository.update(id, values);
  });

export const deleteRedemptionCode = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await redemptionCodesRepository.remove(id);
    return { id };
  });
