import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoStudents } from "./demo-data";
import {
  type Student,
  type StudentInput,
  type StudentListParams,
  studentInputSchema,
  studentListParamsSchema,
  studentUpdateSchema,
} from "./schema";

export const studentsRepository: Repository<Student, StudentInput> =
  memoryRepository<Student, StudentInput>(demoStudents, {
    searchFields: ["name", "className"],
    sortFields: ["name", "wpm", "accuracy", "createdAt"],
    defaultSort: { field: "name", dir: "asc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

export const listStudents = createServerFn({ method: "GET" })
  .validator((data: StudentListParams) => studentListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return studentsRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
    });
  });

export const createStudent = createServerFn({ method: "POST" })
  .validator((data: unknown) => studentInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return studentsRepository.create(data);
  });

export const updateStudent = createServerFn({ method: "POST" })
  .validator((data: unknown) => studentUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return studentsRepository.update(id, values);
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await studentsRepository.remove(id);
    return { id };
  });
