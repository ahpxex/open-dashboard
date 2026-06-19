import { z } from "zod";

export const refundReasons = [
  "duplicate",
  "fraudulent",
  "requested_by_customer",
  "defective",
] as const;
export type RefundReason = (typeof refundReasons)[number];

export const refundStatuses = ["pending", "approved", "rejected"] as const;
export type RefundStatus = (typeof refundStatuses)[number];

export type Refund = {
  id: string;
  orderRef: string;
  customer: string;
  amount: number;
  reason: RefundReason;
  status: RefundStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const refundInputSchema = z.object({
  orderRef: z.string().min(1, "Order reference is required"),
  customer: z.string().min(1, "Customer is required"),
  amount: z.coerce.number().min(0, "Amount must be ≥ 0"),
  reason: z.enum(refundReasons),
  status: z.enum(refundStatuses),
});
export type RefundInput = z.infer<typeof refundInputSchema>;

export const refundFormSchema = z.object({
  orderRef: z.string().min(1, "Order reference is required"),
  customer: z.string().min(1, "Customer is required"),
  amount: z
    .number({ message: "Amount is required" })
    .min(0, "Amount must be ≥ 0"),
  reason: z.enum(refundReasons),
  status: z.enum(refundStatuses),
});

export const refundUpdateSchema = refundInputSchema.extend({
  id: z.string().min(1),
});
export type RefundUpdate = z.infer<typeof refundUpdateSchema>;

export const refundListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
  reason: z.string().optional().default(""),
});
export type RefundListParams = z.infer<typeof refundListParamsSchema>;
