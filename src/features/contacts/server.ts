import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoContacts } from "./demo-data";
import {
  type Contact,
  type ContactInput,
  type ContactListParams,
  contactInputSchema,
  contactListParamsSchema,
  contactUpdateSchema,
} from "./schema";

export const contactsRepository: Repository<Contact, ContactInput> =
  memoryRepository<Contact, ContactInput>(demoContacts, {
    searchFields: ["name", "email", "company", "title"],
    sortFields: ["name", "company", "createdAt"],
    defaultSort: { field: "name", dir: "asc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

export const listContacts = createServerFn({ method: "GET" })
  .validator((data: ContactListParams) => contactListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return contactsRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
    });
  });

export const createContact = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return contactsRepository.create(data);
  });

export const updateContact = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return contactsRepository.update(id, values);
  });

export const deleteContact = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await contactsRepository.remove(id);
    return { id };
  });
