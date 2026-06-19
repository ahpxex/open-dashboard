import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoLeaveRequests } from "./demo-data";
import {
  type LeaveInput,
  type LeaveListParams,
  type LeaveRequest,
  leaveInputSchema,
  leaveListParamsSchema,
  leaveUpdateSchema,
} from "./schema";

export const leaveRequestsRepository: Repository<LeaveRequest, LeaveInput> =
  memoryRepository<LeaveRequest, LeaveInput>(demoLeaveRequests, {
    searchFields: ["employee"],
    sortFields: ["date", "createdAt"],
    defaultSort: { field: "date", dir: "asc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

export const listLeaveRequests = createServerFn({ method: "GET" })
  .validator((data: LeaveListParams) => leaveListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return leaveRequestsRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
    });
  });

export const createLeaveRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => leaveInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return leaveRequestsRepository.create(data);
  });

export const updateLeaveRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => leaveUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return leaveRequestsRepository.update(id, values);
  });

export const deleteLeaveRequest = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await leaveRequestsRepository.remove(id);
    return { id };
  });
