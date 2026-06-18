import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import {
  type ProductListParams,
  productInputSchema,
  productListParamsSchema,
  productUpdateSchema,
} from "./schema";

/** Whitelist of sortable columns — never sort by raw user input. */
const sortableColumns = {
  name: products.name,
  category: products.category,
  price: products.price,
  stock: products.stock,
  createdAt: products.createdAt,
} as const;

export const listProducts = createServerFn({ method: "GET" })
  .validator((data: ProductListParams) => productListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();

    const conditions: SQL[] = [];
    if (data.search) {
      const term = `%${data.search}%`;
      const matcher = or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.category, term),
      );
      if (matcher) conditions.push(matcher);
    }
    if (data.status) {
      conditions.push(eq(products.status, data.status));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn =
      sortableColumns[data.sortBy as keyof typeof sortableColumns] ??
      products.createdAt;
    const orderBy = data.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

    const offset = (data.page - 1) * data.pageSize;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(where)
        .orderBy(orderBy)
        .limit(data.pageSize)
        .offset(offset),
      db.select({ value: count() }).from(products).where(where),
    ]);

    return { rows, total: totalResult[0]?.value ?? 0 };
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return row ?? null;
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const [row] = await db.insert(products).values(data).returning();
    return row;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    const [row] = await db
      .update(products)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await db.delete(products).where(eq(products.id, id));
    return { id };
  });
