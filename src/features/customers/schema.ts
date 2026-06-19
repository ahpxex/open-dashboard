import { z } from "zod";

export const customerPlans = ["free", "pro", "scale"] as const;
export type CustomerPlan = (typeof customerPlans)[number];

export const customerStatuses = ["trial", "active", "churned"] as const;
export type CustomerStatus = (typeof customerStatuses)[number];

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: CustomerPlan;
  mrr: number;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const customerInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  company: z.string().min(1, "Company is required"),
  plan: z.enum(customerPlans),
  mrr: z.coerce.number().min(0, "MRR must be ≥ 0"),
  status: z.enum(customerStatuses),
});
export type CustomerInput = z.infer<typeof customerInputSchema>;

export const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  company: z.string().min(1, "Company is required"),
  plan: z.enum(customerPlans),
  mrr: z.number({ message: "MRR is required" }).min(0, "MRR must be ≥ 0"),
  status: z.enum(customerStatuses),
});

export const customerUpdateSchema = customerInputSchema.extend({
  id: z.string().min(1),
});
export type CustomerUpdate = z.infer<typeof customerUpdateSchema>;

export const customerListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  plan: z.string().optional().default(""),
  status: z.string().optional().default(""),
});
export type CustomerListParams = z.infer<typeof customerListParamsSchema>;
