import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoEmployees } from "./demo-data";
import {
  type Employee,
  type EmployeeInput,
  type EmployeeListParams,
  employeeInputSchema,
  employeeListParamsSchema,
  employeeUpdateSchema,
} from "./schema";

export const employeesRepository: Repository<Employee, EmployeeInput> =
  memoryRepository<Employee, EmployeeInput>(demoEmployees, {
    searchFields: ["name", "email", "title"],
    sortFields: ["name", "createdAt"],
    filterFields: ["department"],
    defaultSort: { field: "name", dir: "asc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: EmployeeListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.department ? { department: data.department } : undefined,
  };
}

export const listEmployees = createServerFn({ method: "GET" })
  .validator((data: EmployeeListParams) => employeeListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return employeesRepository.list(toListParams(data));
  });

export const createEmployee = createServerFn({ method: "POST" })
  .validator((data: unknown) => employeeInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return employeesRepository.create(data);
  });

export const updateEmployee = createServerFn({ method: "POST" })
  .validator((data: unknown) => employeeUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return employeesRepository.update(id, values);
  });

export const deleteEmployee = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await employeesRepository.remove(id);
    return { id };
  });
