import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import {
  type OrderListParams,
  ordersInputSchema,
  ordersListParamsSchema,
  ordersUpdateSchema,
} from "./schema";

const sortableColumns = {
  name: orders.name,
  status: orders.status,
  createdAt: orders.createdAt,
} as const;

export const listOrders = createServerFn({ method: "GET" })
  .validator((data: OrderListParams) => ordersListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();

    const conditions: SQL[] = [];
    if (data.search) {
      const term = `%${data.search}%`;
      conditions.push(ilike(orders.name, term));
    }
    if (data.status) conditions.push(eq(orders.status, data.status));
    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn =
      sortableColumns[data.sortBy as keyof typeof sortableColumns] ??
      orders.createdAt;
    const orderBy = data.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (data.page - 1) * data.pageSize;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(where)
        .orderBy(orderBy)
        .limit(data.pageSize)
        .offset(offset),
      db.select({ value: count() }).from(orders).where(where),
    ]);

    return { rows, total: totalResult[0]?.value ?? 0 };
  });

export const createOrders = createServerFn({ method: "POST" })
  .validator((data: unknown) => ordersInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const [row] = await db.insert(orders).values(data).returning();
    return row;
  });

export const updateOrders = createServerFn({ method: "POST" })
  .validator((data: unknown) => ordersUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    const [row] = await db
      .update(orders)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return row;
  });

export const deleteOrders = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await db.delete(orders).where(eq(orders.id, id));
    return { id };
  });
