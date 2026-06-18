import { z } from "zod";

export const productStatuses = [
  "available",
  "out_of_stock",
  "discontinued",
] as const;

export type ProductStatus = (typeof productStatuses)[number];

/** Form / mutation input for a product. */
export const productInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  stock: z.coerce.number().int().min(0, "Stock must be ≥ 0"),
  status: z.enum(productStatuses),
  description: z.string().optional().default(""),
});

export type ProductInput = z.infer<typeof productInputSchema>;

/**
 * Client-side form validator. Mirrors {@link productInputSchema} but keeps
 * numeric fields as real numbers (no coercion) so its input type matches the
 * TanStack Form values exactly. The server still parses with the coercing
 * schema, which defends against string inputs over the wire.
 */
export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number({ message: "Price is required" }).min(0, "Price must be ≥ 0"),
  stock: z
    .number({ message: "Stock is required" })
    .int("Stock must be a whole number")
    .min(0, "Stock must be ≥ 0"),
  status: z.enum(productStatuses),
  description: z.string(),
});

export const productUpdateSchema = productInputSchema.extend({
  id: z.string().min(1),
});

export type ProductUpdate = z.infer<typeof productUpdateSchema>;

/** List query parameters (pagination, sorting, search, status filter). */
export const productListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
});

export type ProductListParams = z.infer<typeof productListParamsSchema>;
