import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoClasses } from "./demo-data";
import {
  type ClassGroup,
  type ClassInput,
  type ClassListParams,
  classInputSchema,
  classListParamsSchema,
  classUpdateSchema,
} from "./schema";

export const classesRepository: Repository<ClassGroup, ClassInput> =
  memoryRepository<ClassGroup, ClassInput>(demoClasses, {
    searchFields: ["name", "teacher"],
    sortFields: ["name", "studentCount", "createdAt"],
    filterFields: ["level"],
    defaultSort: { field: "name", dir: "asc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: ClassListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.level ? { level: data.level } : undefined,
  };
}

export const listClasses = createServerFn({ method: "GET" })
  .validator((data: ClassListParams) => classListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return classesRepository.list(toListParams(data));
  });

export const createClass = createServerFn({ method: "POST" })
  .validator((data: unknown) => classInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return classesRepository.create(data);
  });

export const updateClass = createServerFn({ method: "POST" })
  .validator((data: unknown) => classUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return classesRepository.update(id, values);
  });

export const deleteClass = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await classesRepository.remove(id);
    return { id };
  });
