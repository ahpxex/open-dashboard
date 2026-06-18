import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { type NewProduct, type Product, products } from "@/db/schema";
import { drizzleRepository } from "@/infra/data/drizzle-repository";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { hasDatabase } from "@/lib/backend";
import { requireUser } from "@/lib/require-user";
import { demoProducts } from "./demo-data";
import {
  type ProductListParams,
  productInputSchema,
  productListParamsSchema,
  productUpdateSchema,
} from "./schema";

/**
 * The products resource is backed by Postgres via the Drizzle adapter when a
 * database is configured, and by the in-memory adapter otherwise (zero-config
 * `bun dev`). Swapping to a REST/GraphQL backend means changing only this
 * binding — the server fns, queries, table, and forms stay the same.
 */
export const productsRepository: Repository<Product, NewProduct> = hasDatabase
  ? drizzleRepository(products, {
      searchColumns: [products.name, products.sku, products.category],
      sortColumns: {
        name: products.name,
        category: products.category,
        price: products.price,
        stock: products.stock,
        createdAt: products.createdAt,
      },
      filterColumns: { status: products.status },
      defaultSort: { column: products.createdAt, dir: "desc" },
      updatedAtKey: "updatedAt",
    })
  : memoryRepository<Product, NewProduct>(demoProducts, {
      searchFields: ["name", "sku", "category"],
      sortFields: ["name", "category", "price", "stock", "createdAt"],
      filterFields: ["status"],
      defaultSort: { field: "createdAt", dir: "desc" },
      updatedAtKey: "updatedAt",
    });

/** Map the resource's params (flat `status`) to the repository's `filters`. */
function toListParams(data: ProductListParams) {
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: data.status ? { status: data.status } : undefined,
  };
}

export const listProducts = createServerFn({ method: "GET" })
  .validator((data: ProductListParams) => productListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return productsRepository.list(toListParams(data));
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    return productsRepository.getOne(id);
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return productsRepository.create(data);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return productsRepository.update(id, values);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await productsRepository.remove(id);
    return { id };
  });

export const deleteProducts = createServerFn({ method: "POST" })
  .validator((ids: unknown) => z.array(z.string().min(1)).min(1).parse(ids))
  .handler(async ({ data: ids }) => {
    await requireUser();
    await Promise.all(ids.map((id) => productsRepository.remove(id)));
    return { ids };
  });
