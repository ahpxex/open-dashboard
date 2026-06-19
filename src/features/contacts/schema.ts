import { z } from "zod";

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export const contactInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const contactUpdateSchema = contactInputSchema.extend({
  id: z.string().min(1),
});
export type ContactUpdate = z.infer<typeof contactUpdateSchema>;

export const contactListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
export type ContactListParams = z.infer<typeof contactListParamsSchema>;
