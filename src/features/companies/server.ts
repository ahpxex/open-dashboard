import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoCompanies } from "./demo-data";
import {
  type Company,
  type CompanyInput,
  type CompanyListParams,
  companyInputSchema,
  companyListParamsSchema,
  companyUpdateSchema,
} from "./schema";

export const companiesRepository: Repository<Company, CompanyInput> =
  memoryRepository<Company, CompanyInput>(demoCompanies, {
    searchFields: ["name", "location"],
    sortFields: ["name", "size", "createdAt"],
    filterFields: ["industry"],
    defaultSort: { field: "name", dir: "asc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: CompanyListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.industry ? { industry: data.industry } : undefined,
  };
}

export const listCompanies = createServerFn({ method: "GET" })
  .validator((data: CompanyListParams) => companyListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return companiesRepository.list(toListParams(data));
  });

export const getCompany = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return companiesRepository.getOne(id);
  });

export const createCompany = createServerFn({ method: "POST" })
  .validator((data: unknown) => companyInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return companiesRepository.create(data);
  });

export const updateCompany = createServerFn({ method: "POST" })
  .validator((data: unknown) => companyUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return companiesRepository.update(id, values);
  });

export const deleteCompany = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await companiesRepository.remove(id);
    return { id };
  });
