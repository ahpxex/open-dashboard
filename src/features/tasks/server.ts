import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoTasks } from "./demo-data";
import {
  type Task,
  type TaskInput,
  type TaskListParams,
  taskInputSchema,
  taskListParamsSchema,
  taskUpdateSchema,
} from "./schema";

export const tasksRepository: Repository<Task, TaskInput> = memoryRepository<
  Task,
  TaskInput
>(demoTasks, {
  searchFields: ["title", "assignee"],
  sortFields: ["title", "createdAt"],
  defaultSort: { field: "createdAt", dir: "asc" },
  createdAtKey: "createdAt",
  updatedAtKey: "updatedAt",
});

export const listTasks = createServerFn({ method: "GET" })
  .validator((data: TaskListParams) => taskListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return tasksRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
    });
  });

export const createTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => taskInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return tasksRepository.create(data);
  });

export const updateTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => taskUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return tasksRepository.update(id, values);
  });

export const deleteTask = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await tasksRepository.remove(id);
    return { id };
  });
