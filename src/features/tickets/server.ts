import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoTickets } from "./demo-data";
import {
  type Ticket,
  type TicketInput,
  type TicketListParams,
  ticketInputSchema,
  ticketListParamsSchema,
  ticketUpdateSchema,
} from "./schema";

export const ticketsRepository: Repository<Ticket, TicketInput> =
  memoryRepository<Ticket, TicketInput>(demoTickets, {
    searchFields: ["subject", "requester", "assignee"],
    sortFields: ["subject", "createdAt", "updatedAt"],
    filterFields: ["status", "priority"],
    defaultSort: { field: "updatedAt", dir: "desc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: TicketListParams) {
  const filters: Record<string, string> = {};
  if (data.status) filters.status = data.status;
  if (data.priority) filters.priority = data.priority;
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

export const listTickets = createServerFn({ method: "GET" })
  .validator((data: TicketListParams) => ticketListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return ticketsRepository.list(toListParams(data));
  });

export const getTicket = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return ticketsRepository.getOne(id);
  });

export const createTicket = createServerFn({ method: "POST" })
  .validator((data: unknown) => ticketInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return ticketsRepository.create(data);
  });

export const updateTicket = createServerFn({ method: "POST" })
  .validator((data: unknown) => ticketUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return ticketsRepository.update(id, values);
  });

export const deleteTicket = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await ticketsRepository.remove(id);
    return { id };
  });
