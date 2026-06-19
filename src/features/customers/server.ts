import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoCustomers } from "./demo-data";
import {
  type Customer,
  type CustomerInput,
  type CustomerListParams,
  customerInputSchema,
  customerListParamsSchema,
  customerUpdateSchema,
} from "./schema";

export const customersRepository: Repository<Customer, CustomerInput> =
  memoryRepository<Customer, CustomerInput>(demoCustomers, {
    searchFields: ["name", "email", "company"],
    sortFields: ["name", "company", "mrr", "createdAt"],
    filterFields: ["plan", "status"],
    defaultSort: { field: "createdAt", dir: "desc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: CustomerListParams) {
  const filters: Record<string, string> = {};
  if (data.plan) filters.plan = data.plan;
  if (data.status) filters.status = data.status;
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

export const listCustomers = createServerFn({ method: "GET" })
  .validator((data: CustomerListParams) => customerListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return customersRepository.list(toListParams(data));
  });

export const getCustomer = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return customersRepository.getOne(id);
  });

export const createCustomer = createServerFn({ method: "POST" })
  .validator((data: unknown) => customerInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return customersRepository.create(data);
  });

export const updateCustomer = createServerFn({ method: "POST" })
  .validator((data: unknown) => customerUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return customersRepository.update(id, values);
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await customersRepository.remove(id);
    return { id };
  });

export const deleteCustomers = createServerFn({ method: "POST" })
  .validator((ids: unknown) => z.array(z.string().min(1)).min(1).parse(ids))
  .handler(async ({ data: ids }) => {
    await requireUser();
    await Promise.all(ids.map((id) => customersRepository.remove(id)));
    return { ids };
  });
