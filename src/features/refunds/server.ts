import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoRefunds } from "./demo-data";
import {
  type Refund,
  type RefundInput,
  type RefundListParams,
  refundInputSchema,
  refundListParamsSchema,
  refundUpdateSchema,
} from "./schema";

export const refundsRepository: Repository<Refund, RefundInput> =
  memoryRepository<Refund, RefundInput>(demoRefunds, {
    searchFields: ["orderRef", "customer"],
    sortFields: ["amount", "createdAt"],
    filterFields: ["status", "reason"],
    defaultSort: { field: "createdAt", dir: "desc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: RefundListParams) {
  const filters: Record<string, string> = {};
  if (data.status) filters.status = data.status;
  if (data.reason) filters.reason = data.reason;
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

export const listRefunds = createServerFn({ method: "GET" })
  .validator((data: RefundListParams) => refundListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return refundsRepository.list(toListParams(data));
  });

export const createRefund = createServerFn({ method: "POST" })
  .validator((data: unknown) => refundInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return refundsRepository.create(data);
  });

export const updateRefund = createServerFn({ method: "POST" })
  .validator((data: unknown) => refundUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return refundsRepository.update(id, values);
  });

export const deleteRefund = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await refundsRepository.remove(id);
    return { id };
  });
