import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoUsers } from "./demo-data";
import {
  type User,
  type UserInput,
  type UserListParams,
  userInputSchema,
  userListParamsSchema,
  userUpdateSchema,
} from "./schema";

/**
 * The users resource is backed by the in-memory adapter (zero-config demo). To
 * persist it, add a Drizzle table and swap this binding for `drizzleRepository`
 * — the server fns, queries, table, and form stay the same.
 */
export const usersRepository: Repository<User, UserInput> = memoryRepository<
  User,
  UserInput
>(demoUsers, {
  searchFields: ["name", "email"],
  sortFields: ["name", "email", "createdAt"],
  filterFields: ["role", "status"],
  defaultSort: { field: "createdAt", dir: "desc" },
  createdAtKey: "createdAt",
  updatedAtKey: "updatedAt",
});

function toListParams(data: UserListParams) {
  const filters: Record<string, string> = {};
  if (data.role) filters.role = data.role;
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

export const listUsers = createServerFn({ method: "GET" })
  .validator((data: UserListParams) => userListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return usersRepository.list(toListParams(data));
  });

export const getUser = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return usersRepository.getOne(id);
  });

export const createUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => userInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return usersRepository.create(data);
  });

export const updateUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => userUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return usersRepository.update(id, values);
  });

export const deleteUser = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await usersRepository.remove(id);
    return { id };
  });

export const deleteUsers = createServerFn({ method: "POST" })
  .validator((ids: unknown) => z.array(z.string().min(1)).min(1).parse(ids))
  .handler(async ({ data: ids }) => {
    await requireUser();
    await Promise.all(ids.map((id) => usersRepository.remove(id)));
    return { ids };
  });
