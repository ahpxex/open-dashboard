import { z } from "zod";

export const ordersStatuses = ["active", "archived"] as const;
export type OrderStatus = (typeof ordersStatuses)[number];

export const ordersInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(ordersStatuses),
  description: z.string().optional().default(""),
});
export type OrderInput = z.infer<typeof ordersInputSchema>;

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
