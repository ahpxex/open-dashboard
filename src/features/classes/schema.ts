import { z } from "zod";

export const classLevels = ["beginner", "intermediate", "advanced"] as const;
export type ClassLevel = (typeof classLevels)[number];

export type ClassGroup = {
  id: string;
  name: string;
  teacher: string;
  studentCount: number;
  level: ClassLevel;
  createdAt: Date;
  updatedAt: Date;
};

export const classInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teacher: z.string().min(1, "Teacher is required"),
  studentCount: z.coerce.number().int().min(0, "Must be ≥ 0"),
  level: z.enum(classLevels),
});
export type ClassInput = z.infer<typeof classInputSchema>;

export const classFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  teacher: z.string().min(1, "Teacher is required"),
  studentCount: z.number({ message: "Required" }).int().min(0, "Must be ≥ 0"),
  level: z.enum(classLevels),
});

export const classUpdateSchema = classInputSchema.extend({
  id: z.string().min(1),
});
export type ClassUpdate = z.infer<typeof classUpdateSchema>;

export const classListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  level: z.string().optional().default(""),
});
export type ClassListParams = z.infer<typeof classListParamsSchema>;
