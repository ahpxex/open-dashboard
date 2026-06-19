import { z } from "zod";

export const dealStages = [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;
export type DealStage = (typeof dealStages)[number];

export type Deal = {
  id: string;
  name: string;
  company: string;
  value: number;
  owner: string;
  stage: DealStage;
  createdAt: Date;
  updatedAt: Date;
};

export const dealInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  value: z.coerce.number().min(0, "Value must be ≥ 0"),
  owner: z.string().min(1, "Owner is required"),
  stage: z.enum(dealStages),
});
export type DealInput = z.infer<typeof dealInputSchema>;

export const dealFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  value: z.number({ message: "Value is required" }).min(0, "Value must be ≥ 0"),
  owner: z.string().min(1, "Owner is required"),
  stage: z.enum(dealStages),
});

/** Partial update — the pipeline's drag-and-drop sends only `{ id, stage }`. */
export const dealUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  value: z.coerce.number().min(0).optional(),
  owner: z.string().min(1).optional(),
  stage: z.enum(dealStages).optional(),
});
export type DealUpdate = z.infer<typeof dealUpdateSchema>;

export const dealListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  stage: z.string().optional().default(""),
});
export type DealListParams = z.infer<typeof dealListParamsSchema>;

export const allDealsParams: DealListParams = {
  page: 1,
  pageSize: 200,
  search: "",
  stage: "",
};
