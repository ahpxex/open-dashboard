import { z } from "zod";

export const companyIndustries = [
  "saas",
  "fintech",
  "healthcare",
  "ecommerce",
  "media",
  "other",
] as const;
export type CompanyIndustry = (typeof companyIndustries)[number];

export type Company = {
  id: string;
  name: string;
  industry: CompanyIndustry;
  size: number;
  location: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
};

export const companyInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  industry: z.enum(companyIndustries),
  size: z.coerce.number().int().min(1, "Size must be ≥ 1"),
  location: z.string().min(1, "Location is required"),
  website: z.string().min(1, "Website is required"),
});
export type CompanyInput = z.infer<typeof companyInputSchema>;

export const companyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  industry: z.enum(companyIndustries),
  size: z
    .number({ message: "Size is required" })
    .int()
    .min(1, "Size must be ≥ 1"),
  location: z.string().min(1, "Location is required"),
  website: z.string().min(1, "Website is required"),
});

export const companyUpdateSchema = companyInputSchema.extend({
  id: z.string().min(1),
});
export type CompanyUpdate = z.infer<typeof companyUpdateSchema>;

export const companyListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  industry: z.string().optional().default(""),
});
export type CompanyListParams = z.infer<typeof companyListParamsSchema>;
