import { z } from "zod";

export const ordersStatuses = [
  "pending",
  "paid",
  "fulfilled",
  "refunded",
  "cancelled",
] as const;
export type OrderStatus = (typeof ordersStatuses)[number];

/** A single line item. `unitPrice` is in integer minor units (cents). */
export const orderItemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
});
export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const ordersInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customer: z.string().min(1, "Customer is required"),
  status: z.enum(ordersStatuses),
  /** Total in integer minor units (cents). Coerced on the wire. */
  total: z.coerce.number().int().min(0).default(0),
  items: z.array(orderItemSchema).optional().default([]),
  description: z.string().optional().default(""),
});
export type OrderInput = z.infer<typeof ordersInputSchema>;

/** Client-side form validator (input types match the TanStack Form values).
 *  `total` here is in DOLLARS (what the user types); the dialog converts to
 *  cents before hitting `ordersInputSchema`. */
export const ordersFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customer: z.string().min(1, "Customer is required"),
  status: z.enum(ordersStatuses),
  total: z.number().min(0, "Total must be ≥ 0"),
  description: z.string(),
});

export const ordersUpdateSchema = ordersInputSchema.extend({
  id: z.string().min(1),
});
export type OrderUpdate = z.infer<typeof ordersUpdateSchema>;

export const ordersListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
});
export type OrderListParams = z.infer<typeof ordersListParamsSchema>;
