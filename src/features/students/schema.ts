import { z } from "zod";

export type Student = {
  id: string;
  name: string;
  className: string;
  wpm: number;
  accuracy: number;
  lessonsDone: number;
  createdAt: Date;
  updatedAt: Date;
};

export const studentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  className: z.string().min(1, "Class is required"),
  wpm: z.coerce.number().int().min(0, "Must be ≥ 0"),
  accuracy: z.coerce.number().min(0).max(100, "0–100"),
  lessonsDone: z.coerce.number().int().min(0, "Must be ≥ 0"),
});
export type StudentInput = z.infer<typeof studentInputSchema>;

export const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  className: z.string().min(1, "Class is required"),
  wpm: z.number({ message: "Required" }).int().min(0, "Must be ≥ 0"),
  accuracy: z.number({ message: "Required" }).min(0).max(100, "0–100"),
  lessonsDone: z.number({ message: "Required" }).int().min(0, "Must be ≥ 0"),
});

export const studentUpdateSchema = studentInputSchema.extend({
  id: z.string().min(1),
});
export type StudentUpdate = z.infer<typeof studentUpdateSchema>;

export const studentListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
export type StudentListParams = z.infer<typeof studentListParamsSchema>;
